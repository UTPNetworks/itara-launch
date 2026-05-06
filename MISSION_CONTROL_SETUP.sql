-- ============================================================
-- MISSION CONTROL REAL DATA TABLES
-- User earnings, listings, rentals, and transactions
-- ============================================================

-- 1. USERS TABLE (Extended from Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  tier TEXT DEFAULT 'FREE', -- FREE, BASIC, PRO, ENTERPRISE
  balance DECIMAL(20, 2) DEFAULT 0.00,
  escrow DECIMAL(20, 2) DEFAULT 0.00,
  pending_payout DECIMAL(20, 2) DEFAULT 0.00,
  payout_wallet TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USER LISTINGS TABLE (GPUs and Models they're offering)
CREATE TABLE IF NOT EXISTS public.user_listings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL, -- 'GPU', 'MODEL', 'TASK'
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  price_unit TEXT DEFAULT 'per_hour', -- per_hour, per_day, flat_rate
  status TEXT DEFAULT 'DRAFT', -- DRAFT, AVAILABLE, RENTED, PAUSED, INACTIVE
  image_url TEXT,
  specs JSONB, -- GPU specs, model details, etc.
  total_earnings DECIMAL(20, 2) DEFAULT 0.00,
  active_rentals INT DEFAULT 0,
  utilization DECIMAL(5, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT user_listings_unique UNIQUE(user_id, name)
);

-- 3. USER RENTALS TABLE (What they're renting)
CREATE TABLE IF NOT EXISTS public.user_rentals (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id BIGSERIAL NOT NULL REFERENCES public.user_listings(id),
  renter_user_id UUID, -- Who is renting from this user
  provider_name TEXT NOT NULL,
  provider_listing TEXT NOT NULL,
  hours_running DECIMAL(10, 2) DEFAULT 0.00,
  hourly_cost DECIMAL(10, 2) NOT NULL,
  total_cost DECIMAL(20, 2) DEFAULT 0.00,
  status TEXT DEFAULT 'RUNNING', -- RUNNING, STOPPED, COMPLETED, PAUSED
  start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TRANSACTIONS TABLE (All earnings and spending)
CREATE TABLE IF NOT EXISTS public.user_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tx_type TEXT NOT NULL, -- EARNING, EXPENSE, PAYOUT, ESCROW, REFUND
  category TEXT, -- GPU_RENTAL, MODEL_SALE, TASK_COMPLETE, TASK_SPEND, etc.
  amount DECIMAL(20, 2) NOT NULL,
  balance_before DECIMAL(20, 2),
  balance_after DECIMAL(20, 2),
  reference_id BIGSERIAL, -- listing_id, rental_id, task_id, etc.
  description TEXT,
  status TEXT DEFAULT 'COMPLETED', -- PENDING, COMPLETED, FAILED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. POSTED TASKS TABLE (Tasks user created)
CREATE TABLE IF NOT EXISTS public.user_tasks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(12, 2) NOT NULL,
  status TEXT DEFAULT 'OPEN', -- OPEN, REVIEWING, IN_PROGRESS, COMPLETED, CANCELLED
  completion_percentage INT DEFAULT 0,
  bids_count INT DEFAULT 0,
  assigned_to_user_id UUID REFERENCES public.users(id),
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CHECKLIST TABLE (Onboarding checklist per user)
CREATE TABLE IF NOT EXISTS public.user_checklist (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  verify_identity BOOLEAN DEFAULT false,
  connect_wallet BOOLEAN DEFAULT false,
  first_listing BOOLEAN DEFAULT false,
  enable_2fa BOOLEAN DEFAULT false,
  invite_collaborator BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  icon TEXT,
  text TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_listings_user_id ON public.user_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_listings_status ON public.user_listings(status);
CREATE INDEX IF NOT EXISTS idx_user_rentals_user_id ON public.user_rentals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON public.user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_created ON public.user_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON public.user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users view own profile"
ON public.users FOR SELECT
USING (auth.uid() = id OR true); -- true allows public viewing of some fields

CREATE POLICY "Users update own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users view own listings"
ON public.user_listings FOR SELECT
USING (auth.uid() = user_id OR true); -- true for public marketplace view

CREATE POLICY "Users manage own listings"
ON public.user_listings FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users view own rentals"
ON public.user_rentals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users view own transactions"
ON public.user_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users manage own tasks"
ON public.user_tasks FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users view own checklist"
ON public.user_checklist FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users manage own notifications"
ON public.user_notifications FOR ALL
USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to get user stats (earnings in last 30 days)
CREATE OR REPLACE FUNCTION get_user_earnings_30d(user_id_param UUID)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM public.user_transactions
  WHERE user_id = user_id_param
  AND tx_type = 'EARNING'
  AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days';
$$ LANGUAGE SQL;

-- Function to get daily earnings (for chart)
CREATE OR REPLACE FUNCTION get_user_daily_earnings(user_id_param UUID, days_back INT DEFAULT 30)
RETURNS TABLE(day TIMESTAMP, earnings DECIMAL) AS $$
  SELECT
    DATE_TRUNC('day', created_at) AS day,
    COALESCE(SUM(amount), 0) AS earnings
  FROM public.user_transactions
  WHERE user_id = user_id_param
  AND tx_type = 'EARNING'
  AND created_at >= CURRENT_TIMESTAMP - (days_back || ' days')::INTERVAL
  GROUP BY DATE_TRUNC('day', created_at)
  ORDER BY day DESC;
$$ LANGUAGE SQL;

-- ============================================================
-- SAMPLE DATA (for testing)
-- ============================================================

-- Note: Insert sample data after users sign up via Google Auth
-- These inserts are commented out - they're done via triggers when users first sign in
