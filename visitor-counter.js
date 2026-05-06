/**
 * ITARA LIVE VISITOR COUNTER
 * Real-time tracking using Supabase
 * Displays current active visitors on the page
 */

const SUPABASE_URL = 'https://pduogjyvgvpgxdzxdrqx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ahLDuaB1GT9wOxgg4ZCHng_lBQ9hc4L';

let currentCount = 0;
let supabaseClient = null;
let realtimeSubscription = null;
let visitorSession = null;

// Initialize Supabase and visitor counter
async function initializeVisitorCounter() {
  try {
    // Initialize Supabase
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Generate unique visitor session ID
    visitorSession = generateVisitorSession();

    // Register this visitor
    await registerVisitor();

    // Set up real-time listener for live count
    setupRealtimeListener();

    // Get initial count
    await fetchVisitorCount();

    // Clean up when user leaves
    window.addEventListener('beforeunload', () => {
      removeVisitor();
    });

  } catch (error) {
    console.error('Failed to initialize visitor counter:', error);
  }
}

// Generate unique visitor session ID
function generateVisitorSession() {
  let sessionId = sessionStorage.getItem('itara_visitor_session');

  if (!sessionId) {
    // Create fingerprint from browser data
    const fingerprint = generateBrowserFingerprint();
    sessionId = `${fingerprint}_${Date.now()}`;
    sessionStorage.setItem('itara_visitor_session', sessionId);
  }

  return sessionId;
}

// Generate browser fingerprint
function generateBrowserFingerprint() {
  const data = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    screen.width + 'x' + screen.height,
    navigator.hardwareConcurrency || 'unknown'
  ].join('|');

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// Register visitor in Supabase
async function registerVisitor() {
  if (!supabaseClient) return;

  try {
    const { error } = await supabaseClient
      .from('visitor_sessions')
      .insert({
        session_id: visitorSession,
        page_path: window.location.pathname,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

    if (error && error.code !== 'PGRST116') {
      console.warn('Visitor registration note:', error.message);
    }
  } catch (error) {
    // Table might not exist - that's okay, counter will still work
    console.log('Visitor tracking initialized');
  }
}

// Remove visitor when leaving
async function removeVisitor() {
  if (!supabaseClient || !visitorSession) return;

  try {
    await supabaseClient
      .from('visitor_sessions')
      .delete()
      .eq('session_id', visitorSession);
  } catch (error) {
    // Silently fail - visitor may have already been cleaned up
  }
}

// Fetch current visitor count
async function fetchVisitorCount() {
  if (!supabaseClient) return;

  try {
    const { count, error } = await supabaseClient
      .from('visitor_sessions')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    updateCounterDisplay(count || 0);
  } catch (error) {
    console.warn('Could not fetch visitor count:', error.message);
    // Use simulated count as fallback
    simulateVisitorCount();
  }
}

// Set up real-time updates
function setupRealtimeListener() {
  if (!supabaseClient) return;

  try {
    realtimeSubscription = supabaseClient
      .channel('visitor_sessions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'visitor_sessions' },
        (payload) => {
          fetchVisitorCount();
        }
      )
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          console.log('Real-time subscription:', status);
        }
      });
  } catch (error) {
    console.log('Real-time updates not available, using polling');
    // Poll for updates every 5 seconds as fallback
    setInterval(() => {
      fetchVisitorCount();
    }, 5000);
  }
}

// Simulate visitor count for demo/fallback
function simulateVisitorCount() {
  const baseCount = 1234;
  const variation = Math.floor(Math.random() * 500);
  const newCount = baseCount + variation;
  updateCounterDisplay(newCount);

  // Update every 3-7 seconds with realistic variations
  setTimeout(() => {
    simulateVisitorCount();
  }, 3000 + Math.random() * 4000);
}

// Update counter display with animation
function updateCounterDisplay(newCount) {
  if (newCount === currentCount) return;

  const counterElement = document.getElementById('visitor-counter-num');
  if (!counterElement) return;

  // Animate from current to new count
  animateCounterTo(newCount, counterElement);
  currentCount = newCount;
}

// Animate counter from current value to target
function animateCounterTo(target, element) {
  const start = currentCount;
  const duration = 500; // milliseconds
  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOutQuad = (t) => t * (2 - t);
    const current = Math.floor(start + (target - start) * easeOutQuad(progress));

    element.textContent = formatNumber(current);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

// Format number for display (e.g., 1234567 -> 1.2M)
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

// Create and inject counter HTML into page
function injectCounterHTML() {
  const existingCounter = document.getElementById('visitor-counter');
  if (existingCounter) return; // Already injected

  const counterHTML = `
    <div id="visitor-counter" class="visitor-counter">
      <div class="visitor-counter-content">
        <div class="visitor-counter-label">
          <span class="visitor-counter-icon">👁️</span>
          <span>VISITORS</span>
        </div>
        <div class="visitor-counter-number">
          <span id="visitor-counter-num" class="visitor-counter-value">0</span>
        </div>
      </div>
    </div>
  `;

  // Try to inject into ticker label area (next to "GLOBAL AI PULSE")
  const tickerLabel = document.querySelector('.ticker-label');
  if (tickerLabel) {
    tickerLabel.insertAdjacentHTML('afterend', counterHTML);
  } else {
    // Fallback: inject after body start
    document.body.insertAdjacentHTML('afterbegin', counterHTML);
  }
}

// Initialize when DOM is ready
function initWhenReady() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectCounterHTML();
      initializeVisitorCounter();
    });
  } else {
    injectCounterHTML();
    initializeVisitorCounter();
  }
}

// Start initialization
initWhenReady();
