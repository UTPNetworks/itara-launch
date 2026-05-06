/**
 * MISSION CONTROL REAL DATA SYSTEM - SIMPLIFIED
 * Fetches actual user data from Supabase with proper error handling
 */

const SUPABASE_URL = 'https://pduogjyvgvpgxdzxdrqx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ahLDuaB1GT9wOxgg4ZCHng_lBQ9hc4L';

let supabaseClient = null;
let dataInitialized = false;

// Initialize Supabase
async function initSupabase() {
  if (!supabaseClient && typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabaseClient;
}

// Get current user
async function getCurrentUser() {
  const sb = await initSupabase();
  if (!sb) return null;

  try {
    const { data: { user }, error } = await sb.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch (e) {
    console.error('Auth error:', e);
    return null;
  }
}

// Simplified fetch with error handling
async function safeQuery(tableName, query) {
  const sb = await initSupabase();
  if (!sb) return null;

  try {
    const result = await query(sb);
    return result;
  } catch (error) {
    console.warn(`Query failed for ${tableName}:`, error.message);
    return null;
  }
}

// Fetch user profile
async function fetchUserProfile(userId) {
  const result = await safeQuery('users', (sb) =>
    sb.from('users').select('*').eq('id', userId).single()
  );

  if (!result || result.error) {
    console.log('No user profile found - creating fresh user defaults');
    return {
      id: userId,
      username: 'Welcome',
      tier: 'FREE',
      balance: 0.00,
      escrow: 0.00,
      pending_payout: 0.00,
      joined: 'Just now'
    };
  }

  return {
    id: result.data.id,
    username: result.data.username || 'User',
    tier: result.data.tier || 'FREE',
    balance: parseFloat(result.data.balance || 0),
    escrow: parseFloat(result.data.escrow || 0),
    pending_payout: parseFloat(result.data.pending_payout || 0),
    joined: result.data.created_at
      ? new Date(result.data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      : 'Just now'
  };
}

// Fetch listings
async function fetchUserListings(userId) {
  const result = await safeQuery('user_listings', (sb) =>
    sb.from('user_listings')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['AVAILABLE', 'RENTED', 'LIVE'])
      .order('created_at', { ascending: false })
  );

  if (!result || result.error) return [];

  return (result.data || []).map(listing => ({
    kind: listing.kind,
    name: listing.name,
    status: listing.status,
    price: `$${listing.price}${listing.price_unit === 'per_hour' ? '/hr' : ''}`,
    earnings: parseFloat(listing.total_earnings || 0),
    util: (parseFloat(listing.utilization || 0)) / 100
  }));
}

// Fetch rentals
async function fetchUserRentals(userId) {
  const result = await safeQuery('user_rentals', (sb) =>
    sb.from('user_rentals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'RUNNING')
      .order('created_at', { ascending: false })
  );

  if (!result || result.error) return [];

  return (result.data || []).map(rental => {
    const hoursRunning = parseFloat(rental.hours_running || 0);
    const daysRunning = Math.floor(hoursRunning / 24);
    const remainingHours = Math.floor(hoursRunning % 24);

    return {
      name: rental.provider_listing || 'GPU Rental',
      runs: `${daysRunning}d ${remainingHours}h`,
      spend: parseFloat(rental.total_cost || 0),
      status: 'RUNNING'
    };
  });
}

// Fetch tasks
async function fetchUserTasks(userId) {
  const result = await safeQuery('user_tasks', (sb) =>
    sb.from('user_tasks')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['OPEN', 'REVIEWING', 'IN_PROGRESS'])
      .order('created_at', { ascending: false })
  );

  if (!result || result.error) return [];

  return (result.data || []).map(task => ({
    title: task.title,
    budget: parseFloat(task.budget),
    stage: task.status === 'REVIEWING'
      ? `REVIEWING · ${task.bids_count || 0} bids`
      : `${task.status} · ${task.completion_percentage || 0}%`
  }));
}

// Fetch checklist
async function fetchUserChecklist(userId) {
  const result = await safeQuery('user_checklist', (sb) =>
    sb.from('user_checklist')
      .select('*')
      .eq('user_id', userId)
      .single()
  );

  const defaultChecklist = [
    { t: 'Verify identity', done: false },
    { t: 'Connect payout wallet', done: false },
    { t: 'List first GPU / model', done: false },
    { t: 'Enable escrow 2FA', done: false },
    { t: 'Invite a collaborator', done: false }
  ];

  if (!result || result.error) return defaultChecklist;

  const data = result.data;
  return [
    { t: 'Verify identity', done: data.verify_identity },
    { t: 'Connect payout wallet', done: data.connect_wallet },
    { t: 'List first GPU / model', done: data.first_listing },
    { t: 'Enable escrow 2FA', done: data.enable_2fa },
    { t: 'Invite a collaborator', done: data.invite_collaborator }
  ];
}

// Fetch notifications
async function fetchUserNotifications(userId) {
  const result = await safeQuery('user_notifications', (sb) =>
    sb.from('user_notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(5)
  );

  if (!result || result.error) return [];

  return (result.data || []).map(notif => {
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
}

// Fetch earnings
async function fetchDailyEarnings(userId) {
  const result = await safeQuery('user_transactions', (sb) =>
    sb.from('user_transactions')
      .select('created_at, amount')
      .eq('user_id', userId)
      .eq('tx_type', 'EARNING')
      .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
  );

  if (!result || result.error) return Array(30).fill(0);

  const earnings = Array(30).fill(0);
  (result.data || []).forEach(row => {
    const dayIndex = Math.floor((Date.now() - new Date(row.created_at)) / 86400000);
    if (dayIndex >= 0 && dayIndex < 30) {
      earnings[29 - dayIndex] += parseFloat(row.amount || 0);
    }
  });

  return earnings;
}

// Main data fetch
async function fetchDashboardData() {
  console.log('📊 Fetching dashboard data...');

  const user = await getCurrentUser();
  if (!user) {
    console.warn('No authenticated user');
    return createFreshUserDashboard();
  }

  console.log('👤 User:', user.id);

  try {
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
      USER: profile,
      LISTINGS: listings,
      RENTALS: rentals,
      TASKS: tasks,
      CHECKLIST: checklist,
      NOTIFS: notifications,
      earnings: earnings,
      TRENDING: []
    };

    console.log('✅ Dashboard data loaded');
    return dashboard;
  } catch (error) {
    console.error('❌ Error:', error);
    return createFreshUserDashboard();
  }
}

// Fresh user defaults
function createFreshUserDashboard() {
  console.log('📋 Returning fresh user defaults');
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

// Initialize
async function initializeDashboardData() {
  try {
    console.log('🔄 Initializing dashboard...');

    // Wait for Supabase to load
    await new Promise(resolve => {
      const checkSupabase = () => {
        if (typeof supabase !== 'undefined') {
          resolve();
        } else {
          setTimeout(checkSupabase, 50);
        }
      };
      checkSupabase();
    });

    const data = await Promise.race([
      fetchDashboardData(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 6000))
    ]);

    window.ITARA_DASH = data;
    dataInitialized = true;
    window.dispatchEvent(new CustomEvent('dashboardDataLoaded', { detail: data }));

    console.log('🎉 Dashboard ready');
    return data;
  } catch (error) {
    console.error('⚠️ Initialization error, using defaults:', error.message);
    window.ITARA_DASH = createFreshUserDashboard();
    dataInitialized = true;
    window.dispatchEvent(new CustomEvent('dashboardDataLoaded', { detail: window.ITARA_DASH }));
    return window.ITARA_DASH;
  }
}

// Start
console.log('Loading dashboard data system...');
initializeDashboardData();

// Exports
window.DashboardRealData = {
  fetchDashboardData,
  getCurrentUser,
  isInitialized: () => dataInitialized
};
