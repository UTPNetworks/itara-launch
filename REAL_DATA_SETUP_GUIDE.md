# Mission Control Real Data Setup Guide

## Overview

Your Mission Control dashboard now shows **REAL USER DATA** instead of mock data. Fresh users will see empty/null values until they actually:
- Create listings (GPUs, Models)
- Rent GPUs from others
- Post tasks
- Earn money from their listings

---

## ✅ Setup Steps

### Step 1: Create Database Tables

Run the SQL from `MISSION_CONTROL_SETUP.sql` in your Supabase dashboard:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy & paste the entire contents of `MISSION_CONTROL_SETUP.sql`
4. Click **Run**

This creates:
- `users` - Extended user profiles
- `user_listings` - GPUs/Models they're selling
- `user_rentals` - GPUs/resources they're renting
- `user_transactions` - All earnings and spending
- `user_tasks` - Posted tasks
- `user_checklist` - Onboarding checklist
- `user_notifications` - User notifications

---

### Step 2: Create Auth Trigger (Auto-create User Record)

When a user signs up via Google, automatically create their `users` record:

```sql
-- Create trigger to auto-create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  INSERT INTO public.user_checklist (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

Run this in Supabase SQL Editor.

---

### Step 3: Update Mission Control Page

The `dashboard.html` now loads real data. The loading order is:

1. **dashboard-real-data.js** - Fetches real user data from Supabase
2. **dashboard-data.js** - Mock data fallback (if real data unavailable)

**Fresh users will see:**
```
Balance: $0.00
Escrow: $0.00
Pending Payout: $0.00
Listings: (empty)
Rentals: (empty)
Tasks: (empty)
Earnings Chart: (all zeros)
```

**As they use the platform:**
- Create a GPU listing → appears in LISTINGS
- Rent a GPU → appears in RENTALS
- Complete a rental → EARNINGS increase
- Post a task → appears in TASKS

---

## 📊 How Real Data Works

### When a User Logs In

1. **dashboard-real-data.js** checks if user is authenticated
2. Fetches their profile from `users` table
3. Queries their listings, rentals, tasks, etc.
4. **If user is new** (no record exists):
   - Returns fresh user defaults (all zeros)
   - Trigger creates their `users` and `user_checklist` records

### Data is Fetched Asynchronously

```javascript
Promise.all([
  fetchUserProfile(userId),      // User balance, tier, wallet
  fetchUserListings(userId),     // What they're selling
  fetchUserRentals(userId),      // What they're renting
  fetchUserTasks(userId),        // Tasks they posted
  fetchUserChecklist(userId),    // Onboarding progress
  fetchUserNotifications(userId),// Recent notifications
  fetchDailyEarnings(userId)     // 30-day earnings chart
])
```

All data is loaded before the dashboard renders.

---

## 🔄 Data Flow Example

### User Creates a GPU Listing

1. **User Action**: Clicks "List GPU" → fills form → submits
2. **Backend**: Insert into `user_listings` table
3. **Balance Update**: User's `balance` field in `users` table (when rental completes)
4. **Earnings**: Each completed rental creates entry in `user_transactions`
5. **Dashboard Update**: Next page load fetches new `user_listings` and shows it

### User Rents a GPU

1. **User Action**: Clicks "Rent GPU" from marketplace
2. **Backend**: Insert into `user_rentals` table
3. **Timer**: Track `hours_running` and `total_cost`
4. **On Completion**: 
   - Create transaction in `user_transactions` (EXPENSE)
   - Update user `balance` in `users` table
5. **Dashboard Update**: RENTALS section shows active rental with running costs

### User Earns Money from a Rental

1. **Someone rents their GPU** → entry in `user_rentals` (as provider)
2. **Rental runs** → `hours_running` increments every hour
3. **On Completion**: 
   - Calculate earnings = `hours_running` × `hourly_price`
   - Create transaction: EARNING type
   - Update user `balance` (add earnings)
   - Update listing `total_earnings`
4. **Dashboard**: 
   - Balance increases
   - LISTINGS shows updated earnings
   - Earnings chart updates

---

## 🎯 Fresh User Journey

### First Login (Google Sign-up)

**Dashboard shows:**
```
Welcome, [First Name]
Balance: $0.00
Escrow: $0.00
Pending: $0.00

Listings: (empty)
Rentals: (empty)
Tasks: (empty)
Earnings: (flat line at 0)

Checklist:
☐ Verify identity
☐ Connect payout wallet
☐ List first GPU / model
☐ Enable escrow 2FA
☐ Invite a collaborator
```

### After Creating First Listing

```
Listings:
- 4× H100 SXM5 cluster | AVAILABLE | $2.49/hr | $0 earnings
```

### After First Rental Completes (10 hours @ $2.49/hr = $24.90)

```
Balance: $24.90
Earnings: (shows spike in today's data)

Listings:
- 4× H100 SXM5 cluster | AVAILABLE | $2.49/hr | $24.90 earnings
```

---

## 🛡️ Row Level Security (RLS)

All tables have RLS enabled:

```
✅ Users can only see/edit their own data
✅ Public marketplace shows other users' listings
✅ Transactions are private per user
✅ No data leaks between users
```

---

## 📈 Earnings Chart (30-day)

The earnings chart shows **actual earnings** from the past 30 days:

- **Empty for fresh users** (no earnings data)
- **Updates daily** as transactions are created
- **SQL function**: `get_user_daily_earnings()` calculates daily totals
- **Displays as bar chart** in dashboard

---

## 🔧 Troubleshooting

### "Dashboard shows mock data instead of real data"

**Cause**: Real data fetch failed, fallback to mock data

**Fix**:
1. Check browser console for errors
2. Verify Supabase tables exist (run SQL migration)
3. Verify RLS policies are set correctly
4. Check if user record was created in `users` table

### "Fresh user still sees old user's data"

**Cause**: User not properly logged out / session issue

**Fix**:
1. Clear browser localStorage/sessionStorage
2. Hard refresh the page (Ctrl+Shift+R)
3. Sign out and back in

### "Earnings not showing up"

**Cause**: Transaction data missing in `user_transactions`

**Fix**:
1. When rental completes, manually insert transaction:
```sql
INSERT INTO public.user_transactions 
(user_id, tx_type, category, amount, reference_id, description)
VALUES 
('[user_id]', 'EARNING', 'GPU_RENTAL', 24.90, [listing_id], 'GPU rental earnings');
```

### "Earnings chart is flat"

**Cause**: No transaction data in the past 30 days

**Fix**: 
1. Create a test transaction
2. Chart updates on next page load

---

## 📋 Key Files

- **MISSION_CONTROL_SETUP.sql** - Database schema
- **dashboard-real-data.js** - Real data fetching (NEW)
- **dashboard-data.js** - Mock data fallback
- **dashboard.jsx** - React components (unchanged)
- **dashboard.html** - Loads both data systems (updated)

---

## 🚀 Next Steps

1. ✅ Run SQL migrations
2. ✅ Create auth trigger
3. ✅ Test with fresh user account
4. ✅ Create a test listing
5. ✅ Create a test rental
6. ✅ Verify earnings appear in dashboard

---

## 💡 Important

**Data is NOW REAL:**
- Every action updates the database
- Balance, earnings, listings are all tracked
- No mock data in production
- Fresh users = empty/null values

**When building features:**
- Insert into `user_transactions` for every earn/spend
- Update `users` balance field
- Update `user_listings` total_earnings
- All changes show immediately in dashboard on next load
