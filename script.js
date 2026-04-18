/* ============================================================
   Itara — Main Script
   ============================================================ */

// === THEME TOGGLE ===
(function () {
  const html = document.documentElement;
  const stored = null; // no localStorage in sandboxed iframes — use matchMedia
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let theme = prefersDark ? 'dark' : 'light';
  html.setAttribute('data-theme', theme);

  const toggle = document.querySelector('[data-theme-toggle]');
  const icon   = document.getElementById('theme-icon');

  function updateIcon(t) {
    if (!icon) return;
    icon.innerHTML = t === 'dark'
      ? '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>'
      : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  }

  updateIcon(theme);

  if (toggle) {
    toggle.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', theme);
      updateIcon(theme);
    });
  }
})();

// === NAV SCROLL SHADOW ===
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 10
      ? '0 4px 24px rgba(0,0,0,0.08)'
      : '';
  }, { passive: true });
})();

// === SEARCH BAR ===
function handleSearch(e) {
  if (e.key === 'Enter') handleSearchClick();
}

function handleSearchClick() {
  const val = document.getElementById('search-input').value.trim();
  if (!val) return;
  // Coming soon — show waitlist modal
  openModal();
}

function fillSearch(text) {
  const input = document.getElementById('search-input');
  if (!input) return;
  input.value = text;
  input.focus();
}

// === WAITLIST MODAL ===
function openModal() {
  const overlay = document.getElementById('itara-modal');
  if (!overlay) return;
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('itara-modal');
  if (!overlay) return;
  overlay.style.display = 'none';
  document.body.style.overflow = '';
}

// Close on backdrop click
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('itara-modal');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('modal-backdrop')) {
        closeModal();
      }
    });
  }
});

// ESC to close any modal
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const waitlist = document.getElementById('itara-modal');
  const signin   = document.getElementById('signin-overlay');
  if (waitlist && waitlist.style.display !== 'none') closeModal();
  if (signin   && signin.style.display   !== 'none') closeSignIn();
});

// Interest chips
function toggleChip(btn) {
  btn.classList.toggle('active');
  const selected = [...document.querySelectorAll('.chip.active')]
    .map(b => b.dataset.value);
  const hidden = document.getElementById('m-interests');
  if (hidden) hidden.value = selected.join(', ');
}

// Waitlist form submit (Formspree)
async function submitWaitlist(e) {
  e.preventDefault();
  const form    = document.getElementById('waitlist-form');
  const btn     = document.getElementById('modal-submit-btn');
  const btnText = document.getElementById('modal-btn-text');
  const arrow   = document.getElementById('modal-btn-arrow');
  const spinner = document.getElementById('modal-btn-spinner');

  btn.disabled = true;
  btnText.textContent = 'Sending…';
  if (arrow)   arrow.style.display   = 'none';
  if (spinner) spinner.style.display = 'block';

  try {
    const data = new FormData(form);
    const res  = await fetch('https://formspree.io/f/mgorkqyk', {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      document.getElementById('modal-form-wrap').style.display = 'none';
      document.getElementById('modal-success').style.display   = 'flex';
    } else {
      throw new Error('Server error');
    }
  } catch {
    btnText.textContent = 'Try again';
    btn.disabled = false;
    if (arrow)   arrow.style.display   = 'inline';
    if (spinner) spinner.style.display = 'none';
  }
}

// ============================================================
//  SUPABASE AUTH
// ============================================================
const SUPA_URL = 'https://pduogjyvgvpgxdzxdrqx.supabase.co';
const SUPA_KEY = 'sb_publishable_ahLDuaB1GT9wOxgg4ZCHng_lBQ9hc4L';
const { createClient } = supabase;
const supa = createClient(SUPA_URL, SUPA_KEY);

// Sign In modal — open
function openSignIn() {
  const overlay = document.getElementById('signin-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    const emailInput = document.getElementById('signin-email');
    if (emailInput) emailInput.focus();
  }, 50);
}

// Sign In modal — close
function closeSignIn(e) {
  if (e && e.target !== document.getElementById('signin-overlay')) return;
  const overlay = document.getElementById('signin-overlay');
  if (!overlay) return;
  overlay.style.display = 'none';
  document.body.style.overflow = '';
  // Reset
  const form = document.getElementById('signin-form');
  if (form) form.reset();
  const errBox = document.getElementById('signin-error');
  if (errBox) errBox.style.display = 'none';
  const formWrap = document.getElementById('signin-form-wrap');
  const successWrap = document.getElementById('signin-success');
  if (formWrap)   formWrap.style.display   = '';
  if (successWrap) successWrap.style.display = 'none';
}

// Password visibility toggle
function togglePw() {
  const input = document.getElementById('signin-password');
  const icon  = document.getElementById('pw-eye');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
  } else {
    input.type = 'password';
    icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  }
}

// Sign In submit
async function submitSignIn(e) {
  e.preventDefault();
  const email    = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;
  const btn      = document.getElementById('signin-btn');
  const btnText  = document.getElementById('signin-btn-text');
  const spinner  = document.getElementById('signin-spinner');
  const errBox   = document.getElementById('signin-error');

  btn.disabled = true;
  btnText.textContent = 'Signing in…';
  spinner.style.display = 'block';
  errBox.style.display  = 'none';

  const { data, error } = await supa.auth.signInWithPassword({ email, password });

  spinner.style.display = 'none';
  btn.disabled = false;
  btnText.textContent = 'Sign In';

  if (error) {
    errBox.textContent = error.message === 'Email not confirmed'
      ? 'Email not confirmed. Please contact your admin.'
      : error.message || 'Sign in failed. Check your credentials.';
    errBox.style.display = 'block';
    return;
  }

  // Success
  document.getElementById('signin-form-wrap').style.display = 'none';
  document.getElementById('signin-success').style.display   = 'flex';
  setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
}

// === FADE IN CARDS ON SCROLL ===
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.module-card');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 80);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition = 'opacity 0.5s var(--ease, ease), transform 0.5s var(--ease, ease)';
    obs.observe(card);
  });
});
