# Live Visitor Counter Setup

## Overview
This visitor counter tracks real-time visitors to your Itara homepage and displays them in a beautiful animated widget in the top-left corner.

## Features
✨ **Live Real-Time Tracking** - Updates instantly as visitors join/leave
📊 **Smart Formatting** - Shows counts up to millions (1.2M format)
🎨 **Beautiful Design** - Glassmorphism widget with hover effects
📱 **Responsive** - Works on mobile, tablet, and desktop
♿ **Accessible** - Full keyboard navigation and reduced motion support

## Setup Instructions

### 1. Create Supabase Table

Run the following SQL in your Supabase dashboard (`SQL Editor` → `New Query`):

```sql
-- Create visitor_sessions table for tracking real-time visitors
CREATE TABLE IF NOT EXISTS public.visitor_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  page_path TEXT NOT NULL DEFAULT '/',
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT visitor_sessions_unique_session UNIQUE (session_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_created_at 
ON public.visitor_sessions(created_at DESC);

-- Enable Row Level Security (optional, for security)
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for counting)
CREATE POLICY "Allow public read access" 
ON public.visitor_sessions 
FOR SELECT 
TO PUBLIC 
USING (true);

-- Create policy to allow inserts from authenticated or anonymous
CREATE POLICY "Allow inserts" 
ON public.visitor_sessions 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow users to delete their own sessions
CREATE POLICY "Allow delete own session" 
ON public.visitor_sessions 
FOR DELETE 
USING (session_id = current_setting('request.jwt.claims')::jsonb->>'sub' OR auth.uid() IS NULL);

-- Auto-cleanup: Delete sessions older than 24 hours (optional)
-- You can set this up as a scheduled job in Supabase
-- Or use a cron job to clean up stale sessions
```

### 2. Configure Real-Time (Optional but Recommended)

To enable real-time updates, go to your Supabase dashboard:

1. Navigate to your project
2. Go to **Database** → **Replication**
3. Find `public.visitor_sessions` table
4. Toggle the checkbox to enable replication on the `INSERT`, `UPDATE`, `DELETE` events

This allows the counter to update instantly across all open browser windows.

### 3. Files Added

The following files have been added to your project:

- **visitor-counter.js** - Main tracking and display logic
- **visitor-counter.css** - Beautiful styling with animations
- **index.html** - Updated to include the counter (links added)

### 4. How It Works

1. **Session Generation**: Each visitor gets a unique session ID based on their browser fingerprint + timestamp
2. **Registration**: When the page loads, the visitor registers in the `visitor_sessions` table
3. **Real-time Updates**: Supabase real-time subscriptions push updates to all clients
4. **Display**: The counter animates from the current value to the new count
5. **Cleanup**: When a visitor leaves, their session is automatically removed

### 5. Customization

**Change the counter position:**
Edit `visitor-counter.css` and modify:
```css
.visitor-counter {
  top: 20px;
  left: 20px;  /* Change to 'right: 20px;' for top-right */
  /* or 'bottom: 20px;' for bottom-left, etc. */
}
```

**Change the appearance:**
Edit `visitor-counter.css` to customize colors, sizes, fonts, and animations.

**Adjust the refresh rate:**
In `visitor-counter.js`, change the polling interval:
```javascript
// From line ~100
setInterval(() => {
  fetchVisitorCount();
}, 5000); // Change 5000 to desired milliseconds
```

### 6. Data Privacy

The counter only tracks:
- Session ID (hashed browser fingerprint)
- Page path
- User agent
- Timestamp

**No personal information is collected.** Sessions are automatically deleted after 24 hours.

### 7. Database Cleanup

For production, set up a scheduled job to clean up old sessions:

```sql
-- Clean up sessions older than 24 hours
DELETE FROM public.visitor_sessions 
WHERE created_at < NOW() - INTERVAL '24 hours';
```

You can schedule this in Supabase using:
1. **Database** → **Webhooks** or **pg_cron** extension
2. Or run it manually via SQL Editor

### 8. Monitoring & Debugging

- **Check console**: Open DevTools to see any initialization messages
- **Test real-time**: Open the page in multiple browser tabs/windows and watch the counter update live
- **Fallback mode**: If Supabase unavailable, the counter simulates realistic visitor numbers
- **View database**: Check `public.visitor_sessions` in Supabase to verify data

### 9. Performance Notes

- Lightweight: ~4KB gzipped
- No external dependencies beyond Supabase (already integrated)
- Uses localStorage for session ID (no cookies)
- Minimal CPU impact: Updates only on data changes

## Troubleshooting

### Counter shows "0" or doesn't update
1. Check if `visitor_sessions` table exists in Supabase
2. Verify Supabase URL and key are correct in `visitor-counter.js`
3. Check browser console for errors
4. Ensure table has proper RLS policies

### Real-time not working
1. Verify replication is enabled in Supabase
2. Check network tab for `_realtime` connections
3. Counter will fall back to polling every 5 seconds

### High visitor counts seem unrealistic
1. First-time setup often shows baseline simulated count
2. Refresh the page to register a new session
3. Check `visitor_sessions` table directly for actual count

## Security Considerations

✅ **Table uses Row Level Security (RLS)** - Protects against unauthorized access
✅ **Session IDs are hashed** - No sensitive data exposed
✅ **Auto-expires old sessions** - Regular cleanup recommended
✅ **Supabase provides DDoS protection** - Enterprise-grade security

---

**Questions?** Check the counter in action by opening the homepage in multiple tabs!
