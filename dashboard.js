// === LUCIDE ICONS ===
lucide.createIcons();

// === THEME TOGGLE ===
(function () {
  const root   = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  const icon   = document.getElementById('db-theme-icon');
  let theme = 'light';
  root.setAttribute('data-theme', theme);

  if (toggle) {
    toggle.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      if (icon) {
        icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
        lucide.createIcons();
      }
    });
  }
})();

// === LIVE CLOCK ===
function updateClock() {
  const now = new Date();
  const h   = now.getHours();
  const m   = String(now.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = (h % 12 || 12);
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const timeEl = document.getElementById('db-time');
  const dateEl = document.getElementById('db-date');
  const greetEl = document.getElementById('greeting-time');

  if (timeEl) timeEl.textContent = `${h12}:${m} ${ampm}`;
  if (dateEl) dateEl.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
  if (greetEl) {
    if (h < 12) greetEl.textContent = 'morning';
    else if (h < 17) greetEl.textContent = 'afternoon';
    else greetEl.textContent = 'evening';
  }
}
updateClock();
setInterval(updateClock, 1000);

// === SIDEBAR TOGGLE ===
const sidebar      = document.getElementById('sidebar');
const dbMain       = document.getElementById('db-main');
const sidebarToggle = document.getElementById('sidebar-toggle');
const toggleIcon   = document.getElementById('toggle-icon');
let sidebarCollapsed = false;

if (sidebarToggle) {
  sidebarToggle.addEventListener('click', () => {
    sidebarCollapsed = !sidebarCollapsed;
    sidebar.classList.toggle('collapsed', sidebarCollapsed);
    if (toggleIcon) {
      toggleIcon.setAttribute('data-lucide', sidebarCollapsed ? 'panel-left-open' : 'panel-left-close');
      lucide.createIcons();
    }
  });
}

// === STAT COUNT-UP ANIMATION ===
function animateCount(el, target, prefix = '', suffix = '', duration = 1200) {
  const start     = 0;
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed  = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * ease);
    el.textContent = prefix + current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Trigger on intersection
const statCards = document.querySelectorAll('.db-stat-card');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const card   = entry.target;
      const target = parseInt(card.dataset.count, 10);
      const prefix = card.dataset.prefix || '';
      const suffix = card.dataset.suffix || '';
      const valueEl = card.querySelector('.db-stat-value');
      if (valueEl && target) animateCount(valueEl, target, prefix, suffix);
      statObserver.unobserve(card);
    }
  });
}, { threshold: 0.2 });
statCards.forEach(c => statObserver.observe(c));

// === MODULE CARD INTERACTIONS ===
document.querySelectorAll('.db-module-card').forEach(card => {
  // Subtle tilt on mousemove
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `translateY(-6px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    card.style.transformOrigin = 'center center';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s, border-color 0.25s';
    setTimeout(() => { card.style.transition = ''; }, 400);
  });
});

// === NAV ACTIVE STATE ===
document.querySelectorAll('.db-nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.db-nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});

// === SEARCH KEYBOARD SHORTCUT (⌘K / Ctrl+K) ===
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const input = document.querySelector('.db-search-input');
    if (input) input.focus();
  }
});

// === NEW ACTION MENU ===
function openNewActionMenu() {
  const menu = document.getElementById('new-action-menu');
  if (menu) {
    menu.style.display = 'flex';
    lucide.createIcons();
  }
}
function closeNewActionMenu() {
  const menu = document.getElementById('new-action-menu');
  if (menu) menu.style.display = 'none';
}
// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeNewActionMenu();
});

// === MARKET PULSE — SIMULATED LIVE UPDATES ===
function nudgeBar() {
  document.querySelectorAll('.db-pulse-bar').forEach(bar => {
    const current = parseFloat(bar.style.width) || 50;
    const delta   = (Math.random() - 0.5) * 8;
    const next    = Math.max(20, Math.min(96, current + delta));
    bar.style.width = next + '%';
  });
}
setInterval(nudgeBar, 4000);

// === FADE-IN SCROLL REVEALS ===
const fadeTargets = document.querySelectorAll('.db-stat-card, .db-module-card, .db-panel, .db-activity-item');
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity  = '1';
        entry.target.style.transform = entry.target.style.transform || '';
      }, i * 40);
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05 });

fadeTargets.forEach(el => {
  el.style.opacity = '0';
  el.style.transition = 'opacity 0.5s cubic-bezier(0.16,1,0.3,1)';
  fadeObserver.observe(el);
});

// === SIMULATED LIVE ACTIVITY PULSE ===
// Adds a subtle pulse to the most recent activity item every few seconds
function pulseActivity() {
  const first = document.querySelector('.db-activity-item');
  if (!first) return;
  first.style.background = 'rgba(79,70,229,0.06)';
  setTimeout(() => { first.style.background = ''; }, 800);
}
setInterval(pulseActivity, 7000);
