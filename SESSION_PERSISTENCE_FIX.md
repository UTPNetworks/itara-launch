# Session Persistence Fix — Login Now Persists Across Page Refreshes

## Problem
Users were being logged out when they refreshed the page or returned to the site. While Supabase properly stored sessions in localStorage, the dashboard wasn't restoring them on page load.

## Root Cause
- Supabase SDK automatically persists sessions to `localStorage` when you sign in
- However, the dashboard boot code only called `getSession()` once
- If the session hadn't been restored from storage yet (timing issue), `getSession()` returned null
- Dashboard would then show the auth gate instead of the user's dashboard

## Solution
Three-part fix to properly restore and monitor sessions:

### 1. **index.html** — Auto-redirect logged-in users
```javascript
// Before mounting the homepage, check if user is already logged in
// If so, redirect to dashboard
```
- New `checkSessionBeforeMount()` function runs before page renders
- If user has valid session → redirects to `/dashboard.html` automatically
- If no session → renders homepage normally

### 2. **dashboard.html** — Restore session on load with retries
```javascript
// Properly restore session from localStorage with fallback retries
async function restoreSession() {
  // Wait for Supabase JS lib to initialize
  // Check if session exists
  // Retry up to 3 times if first check fails (timing safety)
}
```
- `restoreSession()` waits for Supabase to initialize before checking session
- Includes retry logic for timing-sensitive scenarios
- Calls boot() only if session is valid

### 3. **dashboard.html** — Listen for auth state changes
```javascript
// Monitor auth state in real-time
sb.auth.onAuthStateChange((event, session) => {
  // If user signs out → redirect to signin
  // If token refreshed → allow dashboard to continue
})
```
- Listens for `SIGNED_OUT` events and redirects user to signin page
- Catches `TOKEN_REFRESHED` events for seamless session renewal

### 4. **script.js** — Verify session before redirect
```javascript
// After email/password signin, wait for session to be established
// Then redirect to dashboard
```
- Waits 1 second after successful signin
- Verifies session exists before redirecting
- Fallback redirect if verification takes longer

## How It Works Now

### User Signs In (Any Method)
```
User clicks "Sign In" or "Google" 
  ↓
Supabase authenticates (OAuth or email/password)
  ↓
Session stored in browser localStorage by Supabase SDK
  ↓
Page redirects to /dashboard.html
  ↓
Dashboard boot restores session from localStorage
  ↓
Auth listener starts monitoring for session changes
  ↓
Mission Control dashboard renders
```

### User Refreshes Page
```
User presses F5 or refreshes
  ↓
index.html loads (if they were on homepage, unlikely after signin)
  ↓
Session check: "Is user logged in?"
  ↓
YES → Redirect to /dashboard.html
  ↓
Dashboard restores session → renders dashboard
```

### User Returns to Site (New Tab/Next Day)
```
User visits itara.ai again
  ↓
Browser still has localStorage with session
  ↓
index.html checks session → YES → Redirect to dashboard
  ↓
Dashboard loads with existing session → user is logged in
```

### Session Expires (After Inactivity)
```
User hasn't visited for extended period
  ↓
Session expires in Supabase
  ↓
Auth listener detects SIGNED_OUT event
  ↓
Dashboard redirects to /index.html
  ↓
User sees homepage, needs to sign in again
```

## Testing

### Test Case 1: Sign In & Refresh
1. Sign in via Google or email/password
2. Dashboard loads with your data
3. Refresh the page (F5)
4. **Expected**: Dashboard still shows, you're still logged in
5. **Before fix**: Would redirect to signin and ask you to log in again ❌
6. **After fix**: Session restored automatically ✅

### Test Case 2: Sign In & Open New Tab
1. Sign in on tab A
2. Open new tab and visit itara.ai
3. **Expected**: Tab B redirects to dashboard (you're already logged in)
4. **Before fix**: Would show homepage even though logged in ❌
5. **After fix**: Detects existing session and redirects ✅

### Test Case 3: Sign In & Close Browser
1. Sign in via Google or email
2. Close browser completely
3. Wait a few hours
4. Open browser and visit itara.ai
5. **Expected**: If session still valid (24 hrs by default), redirects to dashboard
6. **Before fix**: Would show homepage ❌
7. **After fix**: Session restored from localStorage ✅

## Technical Details

### Session Storage
- Supabase stores session in `localStorage` under key: `sb-{project_id}-auth-token`
- Also stores user data and other auth metadata
- This persists across page refreshes and browser restarts (unless cleared)

### Supabase Auth Events
- `INITIAL_SESSION`: On first page load, if session exists
- `SIGNED_IN`: After successful sign-in
- `SIGNED_OUT`: After sign-out or session expiration
- `TOKEN_REFRESHED`: When access token is automatically renewed

### Session Lifespan
- **Access token**: Valid for ~1 hour
- **Refresh token**: Valid for ~7 days (by default in Supabase)
- **Auto-refresh**: Happens transparently when token expires
- **Manual logout**: User must sign out or browser localStorage must be cleared

## Files Modified

1. **index.html**
   - Added `checkSessionBeforeMount()` to check existing session
   - Redirects to dashboard if already logged in

2. **dashboard.html**
   - Added `restoreSession()` with retry logic
   - Added `setupAuthListener()` to monitor auth state
   - Integrated both into boot flow

3. **script.js**
   - Updated `submitSignIn()` to verify session before redirect
   - Ensures email/password signin properly establishes session

## Troubleshooting

### "Still getting logged out after refresh"
1. Check browser console for errors (F12 → Console tab)
2. Verify localStorage isn't being cleared on page refresh
3. Check if cookies are being blocked
4. Try incognito mode (rules out extensions)

### "Redirect to dashboard is slow"
1. Normal: Takes ~300-500ms due to session restoration retries
2. If taking >3 seconds: Check network tab for slow requests
3. Verify Supabase connectivity isn't slow

### "Stuck on loading screen"
1. Session check is working but dashboard isn't rendering
2. This is usually a React mount issue, not auth
3. Check browser console for JavaScript errors
4. Clear localStorage: `localStorage.clear()` then reload

## Future Improvements

- Add "Stay signed in for X days" option
- Implement remember-device flow (no re-signin on same device)
- Add session indicator showing time until auto-logout
- Implement "Sign out all devices" feature
- Add biometric signin for mobile (fingerprint/face)
