/* ============================================================
   Itara — Dashboard JS
   ============================================================ */

// === ICONS ===
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initClock();
  initGreeting();
  initCountUp();
  initThemeToggle();
  initSidebarToggle();
});

// === THEME TOGGLE ===
function initThemeToggle() {
  const html    = document.documentElement;
  const toggle  = document.querySelector('[data-theme-toggle]');
  const icon    = document.getElementById('db-theme-icon');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let theme = prefersDark ? 'dark' : 'light';
  html.setAttribute('data-theme', theme);
  updateThemeIcon(theme, icon);

  if (toggle) {
    toggle.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', theme);
      updateThemeIcon(theme, icon);
    });
  }
}

function updateThemeIcon(theme, icon) {
  if (!icon) return;
  // Re-render lucide icon by swapping data-lucide attribute
  const parent = icon.closest('[data-theme-toggle]');
  if (!parent) return;
  parent.innerHTML = theme === 'dark'
    ? '<i data-lucide="sun" id="db-theme-icon"></i>'
    : '<i data-lucide="moon" id="db-theme-icon"></i>';
  lucide.createIcons();
}

// === CLOCK ===
function initClock() {
  function tick() {
    const now  = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const el   = document.getElementById('db-time');
    const eld  = document.getElementById('db-date');
    if (el)  el.textContent  = time;
    if (eld) eld.textContent = date;
  }
  tick();
  setInterval(tick, 1000);
}

// === GREETING ===
function initGreeting() {
  const hour = new Date().getHours();
  const el   = document.getElementById('greeting-time');
  if (!el) return;
  if (hour < 12)      el.textContent = 'morning';
  else if (hour < 17) el.textContent = 'afternoon';
  else                el.textContent = 'evening';
}

// === COUNT UP ANIMATION ===
function initCountUp() {
  const cards = document.querySelectorAll('.db-stat-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el      = entry.target.querySelector('.db-stat-value');
      const target  = parseInt(el.dataset.count, 10);
      const suffix  = el.dataset.suffix || '';
      if (!target) return;

      let start = 0;
      const duration = 900;
      const step = 16;
      const increment = target / (duration / step);

      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          start = target;
          clearInterval(timer);
        }
        el.textContent = Math.floor(start).toLocaleString() + suffix;
      }, step);

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  cards.forEach(c => observer.observe(c));
}

// === SIDEBAR TOGGLE ===
function initSidebarToggle() {
  const btn  = document.getElementById('sidebar-toggle');
  const body = document.querySelector('.db-body');
  if (!btn || !body) return;
  btn.addEventListener('click', () => {
    body.classList.toggle('sidebar-collapsed');
  });
}

// === QUICK ACTION MENU ===
function toggleActionMenu() {
  const menu = document.getElementById('action-menu');
  if (!menu) return;
  menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
}

// ESC closes menu
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const menu = document.getElementById('action-menu');
    if (menu) menu.style.display = 'none';
  }
});

// === SUPABASE SIGN OUT ===
async function signOut() {
  const client = supabase.createClient(
    'https://pduogjyvgvpgxdzxdrqx.supabase.co',
    'sb_publishable_ahLDuaB1GT9wOxgg4ZCHng_lBQ9hc4L'
  );
  await client.auth.signOut();
  window.location.replace('index.html');
}

// === LIVE PULSE — subtle activity highlight ===
setInterval(() => {
  const items = document.querySelectorAll('.db-activity-item');
  if (!items.length) return;
  const item = items[0];
  item.style.background = 'rgba(79,70,229,0.04)';
  setTimeout(() => { item.style.background = ''; }, 700);
}, 7000);
