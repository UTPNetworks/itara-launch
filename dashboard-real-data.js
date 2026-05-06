/**
 * MISSION CONTROL REAL DATA SYSTEM
 * Fetches actual user data from Supabase instead of mock data
 * Shows null/empty for fresh users
 */

const SUPABASE_URL = 'https://pduogjyvgvpgxdzxdrqx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ahLDuaB1GT9wOxgg4ZCHng_lBQ9hc4L';
const DATA_FETCH_TIMEOUT = 5000; // 5 second timeout

let supabaseClient = null;
let currentUser = null;
let dataInitialized = false;

// Initialize Supabase
function initSupabase() {
  if (!supabaseClient && typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabaseClient;
}

// Get current authenticated user
async function getCurrentUser() {
  const sb = initSupabase();
  if (!sb) {
    console.warn('Supabase not initialized');
    return null;
  }

  try {
    const { data: { user }, error } = await sb.auth.getUser();
    if (error) {
      console.warn('Failed to get user:', error.message);
      return null;
    }
    console.log('Current user:', user?.id);
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Fetch user profile data
async function fetchUserProfile(userId) {
  const sb = initSupabase();
  if (!sb || !userId) {
    console.warn('Cannot fetch profile: Supabase or userId missing');
    return null;
  }

  try {
    const { data, error } = await sb
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Profile fetch error:', error.message);
      return null;
    }

    // If user doesn't exist, return fresh user defaults
    if (!data) {
      console.log('New user - returning fresh user defaults');
      return {
        id: userId,
        username: 'New User',
        tier: 'FREE',
        balance: 0.00,
        escrow: 0.00,
        pendingPayout: 0.00,
        joined: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      };
    }

    return {
      id: data.id,
      username: data.username || 'User',
      tier: data.tier || 'FREE',
      balance: data.balance || 0.00,
      escrow: data.escrow || 0.00,
      pendingPayout: data.pending_payout || 0.00,
      joined: data.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Just now'
    };
  } catch (error) {
    console.error('Exception in fetchUserProfile:', error);
    return null;
  }
}

// Fetch user listings (GPUs and Models they're selling)
async function fetchUserListings(userId) {
  const sb = initSupabase();
  if (!sb || !userId) return [];

  try {
    const { data, error } = await sb
      .from('user_listings')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['AVAILABLE', 'RENTED', 'LIVE'])
      .order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST116') {
      console.warn('Listings fetch error:', error.message);
      return [];
    }

    const listings = (data || []).map(listing => ({
      kind: listing.kind,
      name: listing.name,
      status: listing.status,
      price: listing.price + (listing.price_unit === 'per_hour' ? '/hr' : ''),
      earnings: listing.total_earnings || 0,
      util: (listing.utilization || 0) / 100
    }));

    console.log('Listings fetched:', listings.length);
    return listings;
  } catch (error) {
    console.error('Exception in fetchUserListings:', error);
    return [];
  }
}

// Fetch user rentals (what they're renting from others)
async function fetchUserRentals(userId) {
  const sb = initSupabase();
  if (!sb || !userId) return [];

  try {
    const { data, error } = await sb
      .from('user_rentals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'RUNNING')
      .order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST116') {
      console.warn('Rentals fetch error:', error.message);
      return [];
    }

    const rentals = (data || []).map(rental => {
      const hoursRunning = rental.hours_running || 0;
      const daysRunning = Math.floor(hoursRunning / 24);
      const remainingHours = Math.floor(hoursRunning % 24);

      return {
        name: rental.provider_listing,
        runs: `${daysRunning}d ${remainingHours}h`,
        spend: rental.total_cost || 0,
        status: 'RUNNING'
      };
    });

    console.log('Rentals fetched:', rentals.length);
    return rentals;
  } catch (error) {
    console.error('Exception in fetchUserRentals:', error);
    return [];
  }
}

// Fetch user tasks (what they've posted)
async function fetchUserTasks(userId) {
  const sb = initSupabase();
  if (!sb || !userId) return [];

  try {
    const { data, error } = await sb
      .from('user_tasks')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['OPEN', 'REVIEWING', 'IN_PROGRESS'])
      .order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST116') {
      console.warn('Tasks fetch error:', error.message);
      return [];
    }

    const tasks = (data || []).map(task => ({
      title: task.title,
      budget: task.budget,
      stage: task.status === 'REVIEWING'
        ? `REVIEWING · ${task.bids_count} bids`
        : `${task.status} · ${task.completion_percentage}%`
    }));

    console.log('Tasks fetched:', tasks.length);
    return tasks;
  } catch (error) {
    console.error('Exception in fetchUserTasks:', error);
    return [];
  }
}

// Fetch user checklist
async function fetchUserChecklist(userId) {
  const sb = initSupabase();
  if (!sb || !userId) return [];

  try {
    const { data, error } = await sb
      .from('user_checklist')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Checklist fetch error:', error.message);
      return getDefaultChecklist();
    }

    if (!data) {
      return getDefaultChecklist();
    }

    return [
      { t: 'Verify identity', done: data.verify_identity },
      { t: 'Connect payout wallet', done: data.connect_wallet },
      { t: 'List first GPU / model', done: data.first_listing },
      { t: 'Enable escrow 2FA', done: data.enable_2fa },
      { t: 'Invite a collaborator', done: data.invite_collaborator }
    ];
  } catch (error) {
    console.error('Exception in fetchUserChecklist:', error);
    return getDefaultChecklist();
  }
}

function getDefaultChecklist() {
  return [
    { t: 'Verify identity', done: false },
    { t: 'Connect payout wallet', done: false },
    { t: 'List first GPU / model', done: false },
    { t: 'Enable escrow 2FA', done: false },
    { t: 'Invite a collaborator', done: false }
  ];
}

// Fetch user notifications
async function fetchUserNotifications(userId) {
  const sb = initSupabase();
  if (!sb || !userId) return [];

  try {
    const { data, error } = await sb
      .from('user_notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error && error.code !== 'PGRST116') {
      console.warn('Notifications fetch error:', error.message);
      return [];
    }

    const notifs = (data || []).map(notif => {
      const createdAt = new Date(notif.created_at);
      const now = new Date();
      const diffMs = now - createdAt;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      let timeStr = 'now';
      if (diffMins < 1) timeStr = 'now';
      else if (diffMins < 60) timeStr = `${diffMins}m`;
      else if (diffHours < 24) timeStr = `${diffHours}h`;
      else timeStr = `${diffDays}d`;

      return {
        icon: notif.icon || '●',
        text: notif.text,
        t: timeStr
      };
    });

    console.log('Notifications fetched:', notifs.length);
    return notifs;
  } catch (error) {
    console.error('Exception in fetchUserNotifications:', error);
    return [];
  }
}

// Fetch 30-day earnings (for chart)
async function fetchDailyEarnings(userId) {
  const sb = initSupabase();
  if (!sb || !userId) {
    return Array(30).fill(0);
  }

  try {
    // Try to use RPC function if available
    const { data, error } = await sb
      .rpc('get_user_daily_earnings', { user_id_param: userId, days_back: 30 });

    if (error) {
      console.warn('RPC earnings fetch (tables may not exist yet):', error.message);
      // Try direct query
      const { data: txData, error: txError } = await sb
        .from('user_transactions')
        .select('created_at, amount')
        .eq('user_id', userId)
        .eq('tx_type', 'EARNING')
        .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString());

      if (txError || !txData || txData.length === 0) {
        return Array(30).fill(0);
      }

      // Aggregate by day
      const earnings = Array(30).fill(0);
      txData.forEach(row => {
        const dayIndex = Math.floor((Date.now() - new Date(row.created_at)) / 86400000);
        if (dayIndex >= 0 && dayIndex < 30) {
          earnings[29 - dayIndex] += parseFloat(row.amount);
        }
      });
      return earnings;
    }

    if (!data || data.length === 0) {
      return Array(30).fill(0);
    }

    const earnings = Array(30).fill(0);
    data.forEach(row => {
      const dayIndex = Math.floor((Date.now() - new Date(row.day)) / 86400000);
      if (dayIndex >= 0 && dayIndex < 30) {
        earnings[29 - dayIndex] = parseFloat(row.earnings);
      }
    });

    console.log('Earnings fetched');
    return earnings;
  } catch (error) {
    console.error('Exception in fetchDailyEarnings:', error);
    return Array(30).fill(0);
  }
}

// Main function to fetch all dashboard data with timeout
async function fetchDashboardData() {
  return Promise.race([
    fetchDashboardDataInternal(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Data fetch timeout')), DATA_FETCH_TIMEOUT)
    )
  ]);
}

async function fetchDashboardDataInternal() {
  try {
    console.log('🚀 Starting dashboard data fetch...');

    const user = await getCurrentUser();
    if (!user) {
      console.warn('No authenticated user - using fresh user defaults');
      return createFreshUserDashboard();
    }

    currentUser = user;
    console.log('👤 Authenticated user:', user.id);

    // Fetch all data in parallel
    const [profile, listings, rentals, tasks, checklist, notifications, earnings] = await Promise.all([
      fetchUserProfile(user.id),
      fetchUserListings(user.id),
      fetchUserRentals(user.id),
      fetchUserTasks(user.id),
      fetchUserChecklist(user.id),
      fetchUserNotifications(user.id),
      fetchDailyEarnings(user.id)
    ]);

    const dashboard = {
      USER: profile || {},
      LISTINGS: listings,
      RENTALS: rentals,
      TASKS: tasks,
      CHECKLIST: checklist,
      NOTIFS: notifications,
      earnings: earnings,
      TRENDING: []
    };

    console.log('✅ Dashboard data loaded successfully');
    return dashboard;
  } catch (error) {
    console.error('❌ Dashboard data fetch failed:', error);
    return createFreshUserDashboard();
  }
}

// Fresh user dashboard (all nulls/empty)
function createFreshUserDashboard() {
  console.log('📋 Using fresh user defaults');
  return {
    USER: {
      name: 'Welcome',
      handle: '@user',
      tier: 'FREE',
      joined: 'Just now',
      balance: 0.00,
      escrow: 0.00,
      pendingPayout: 0.00
    },
    LISTINGS: [],
    RENTALS: [],
    TASKS: [],
    CHECKLIST: getDefaultChecklist(),
    NOTIFS: [],
    earnings: Array(30).fill(0),
    TRENDING: []
  };
}

// Initialize and set global data
async function initializeDashboardData() {
  try {
    console.log('🔄 Initializing dashboard data system...');
    const data = await fetchDashboardData();
    window.ITARA_DASH = data;
    dataInitialized = true;

    // Dispatch event so React components know data is loaded
    window.dispatchEvent(new CustomEvent('dashboardDataLoaded', { detail: data }));

    console.log('🎉 Dashboard data system initialized');
    return data;
  } catch (error) {
    console.error('💥 Failed to initialize dashboard:', error);
    // Set fresh user defaults as fallback
    window.ITARA_DASH = createFreshUserDashboard();
    dataInitialized = true;
    window.dispatchEvent(new CustomEvent('dashboardDataLoaded', { detail: window.ITARA_DASH }));
    return window.ITARA_DASH;
  }
}

// Start initialization when available
function startInitialization() {
  if (typeof supabase !== 'undefined') {
    console.log('📦 Supabase loaded, initializing dashboard...');
    initializeDashboardData();
  } else {
    console.log('⏳ Waiting for Supabase to load...');
    setTimeout(startInitialization, 100);
  }
}

// Begin on script load
console.log('📍 Dashboard real data module loaded');
startInitialization();

// Export for manual use
window.DashboardRealData = {
  fetchDashboardData,
  fetchUserProfile,
  fetchUserListings,
  fetchUserRentals,
  fetchUserTasks,
  fetchDailyEarnings,
  getCurrentUser,
  isInitialized: () => dataInitialized
};
