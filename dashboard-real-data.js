/**
 * MISSION CONTROL REAL DATA SYSTEM
 * Fetches actual user data from Supabase instead of mock data
 * Shows null/empty for fresh users
 */

const SUPABASE_URL = 'https://pduogjyvgvpgxdzxdrqx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ahLDuaB1GT9wOxgg4ZCHng_lBQ9hc4L';

let supabaseClient = null;
let currentUser = null;

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
  if (!sb) return null;

  try {
    const { data: { user }, error } = await sb.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

// Fetch user profile data
async function fetchUserProfile(userId) {
  const sb = initSupabase();
  if (!sb || !userId) return null;

  try {
    const { data, error } = await sb
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // If user doesn't exist, return fresh user defaults
    if (!data) {
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
    console.error('Failed to fetch user profile:', error);
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

    if (error && error.code !== 'PGRST116') throw error;

    return (data || []).map(listing => ({
      kind: listing.kind,
      name: listing.name,
      status: listing.status,
      price: listing.price + (listing.price_unit === 'per_hour' ? '/hr' : ''),
      earnings: listing.total_earnings || 0,
      util: (listing.utilization || 0) / 100
    }));
  } catch (error) {
    console.error('Failed to fetch listings:', error);
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

    if (error && error.code !== 'PGRST116') throw error;

    return (data || []).map(rental => {
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
  } catch (error) {
    console.error('Failed to fetch rentals:', error);
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

    if (error && error.code !== 'PGRST116') throw error;

    return (data || []).map(task => ({
      title: task.title,
      budget: task.budget,
      stage: task.status === 'REVIEWING'
        ? `REVIEWING · ${task.bids_count} bids`
        : `${task.status} · ${task.completion_percentage}%`
    }));
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
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

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      return [
        { t: 'Verify identity', done: false },
        { t: 'Connect payout wallet', done: false },
        { t: 'List first GPU / model', done: false },
        { t: 'Enable escrow 2FA', done: false },
        { t: 'Invite a collaborator', done: false }
      ];
    }

    return [
      { t: 'Verify identity', done: data.verify_identity },
      { t: 'Connect payout wallet', done: data.connect_wallet },
      { t: 'List first GPU / model', done: data.first_listing },
      { t: 'Enable escrow 2FA', done: data.enable_2fa },
      { t: 'Invite a collaborator', done: data.invite_collaborator }
    ];
  } catch (error) {
    console.error('Failed to fetch checklist:', error);
    return [];
  }
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

    if (error && error.code !== 'PGRST116') throw error;

    return (data || []).map(notif => {
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
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
}

// Fetch 30-day earnings (for chart)
async function fetchDailyEarnings(userId) {
  const sb = initSupabase();
  if (!sb || !userId) {
    // Return empty array for fresh user
    return Array(30).fill(0);
  }

  try {
    const { data, error } = await sb
      .rpc('get_user_daily_earnings', { user_id_param: userId, days_back: 30 });

    if (error && error.code !== 'PGRST116') throw error;

    if (!data || data.length === 0) {
      return Array(30).fill(0);
    }

    // Fill in 30 days with actual data
    const earnings = Array(30).fill(0);
    data.forEach(row => {
      const dayIndex = Math.floor((Date.now() - new Date(row.day)) / 86400000);
      if (dayIndex >= 0 && dayIndex < 30) {
        earnings[29 - dayIndex] = parseFloat(row.earnings);
      }
    });

    return earnings;
  } catch (error) {
    console.error('Failed to fetch earnings:', error);
    return Array(30).fill(0);
  }
}

// Main function to fetch all dashboard data
async function fetchDashboardData() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.error('No authenticated user');
      return createFreshUserDashboard();
    }

    currentUser = user;

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

    return {
      USER: profile || {},
      LISTINGS: listings,
      RENTALS: rentals,
      TASKS: tasks,
      CHECKLIST: checklist,
      NOTIFS: notifications,
      earnings: earnings,
      TRENDING: [] // Fetch from global market data if needed
    };
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return createFreshUserDashboard();
  }
}

// Fresh user dashboard (all nulls/empty)
function createFreshUserDashboard() {
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
    CHECKLIST: [
      { t: 'Verify identity', done: false },
      { t: 'Connect payout wallet', done: false },
      { t: 'List first GPU / model', done: false },
      { t: 'Enable escrow 2FA', done: false },
      { t: 'Invite a collaborator', done: false }
    ],
    NOTIFS: [],
    earnings: Array(30).fill(0),
    TRENDING: []
  };
}

// Initialize and set global data
async function initializeDashboardData() {
  const data = await fetchDashboardData();
  window.ITARA_DASH = data;

  // Dispatch event so React components know data is loaded
  window.dispatchEvent(new CustomEvent('dashboardDataLoaded', { detail: data }));

  return data;
}

// Start initialization when available
function startInitialization() {
  if (typeof supabase !== 'undefined') {
    initializeDashboardData();
  } else {
    // Wait for Supabase to load
    setTimeout(startInitialization, 100);
  }
}

// Begin on script load
startInitialization();

// Export for manual use
window.DashboardRealData = {
  fetchDashboardData,
  fetchUserProfile,
  fetchUserListings,
  fetchUserRentals,
  fetchUserTasks,
  fetchDailyEarnings,
  getCurrentUser
};
