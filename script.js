/* ============================================================
   Itara — Main Script
   Auth: Supabase (email/password + Google OAuth)
   Sign-up: 4-step onboarding flow
   ============================================================ */

// ============================================================
//  SUPABASE INIT
// ============================================================
const SUPA_URL = 'https://pduogjyvgvpgxdzxdrqx.supabase.co';
const SUPA_KEY = 'sb_publishable_ahLDuaB1GT9wOxgg4ZCHng_lBQ9hc4L';
const { createClient } = supabase;
const supa = createClient(SUPA_URL, SUPA_KEY);

// ============================================================
//  THEME TOGGLE
// ============================================================
(function () {
  const html = document.documentElement;
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

// ============================================================
//  NAV SCROLL SHADOW
// ============================================================
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 10
      ? '0 4px 24px rgba(0,0,0,0.08)'
      : '';
  }, { passive: true });
})();

// ============================================================
//  UNIVERSAL SEARCH
// ============================================================

// Search data — all categories across the platform
const SEARCH_DATA = [
  // Compute
  { title: 'H100 GPU Rental', meta: 'COMPUTE · From $2.49/hr', category: 'GPU', color: 'cyan', href: '#' },
  { title: 'A100 80GB Cluster', meta: 'COMPUTE · High memory workloads', category: 'GPU', color: 'cyan', href: '#' },
  { title: 'RTX 4090 Node', meta: 'COMPUTE · Consumer-grade inference', category: 'GPU', color: 'cyan', href: '#' },
  { title: 'H200 SXM5', meta: 'COMPUTE · Frontier training', category: 'GPU', color: 'cyan', href: '#' },
  // Exchange
  { title: 'Fine-tuned LLaMA 3 Model', meta: 'EXCHANGE · AI Model', category: 'MODEL', color: 'violet', href: '#' },
  { title: 'GPT-4 Prompt Pack', meta: 'EXCHANGE · Prompt Bundle', category: 'PROMPT', color: 'violet', href: '#' },
  { title: 'Stable Diffusion XL Agent', meta: 'EXCHANGE · AI Agent', category: 'AGENT', color: 'violet', href: '#' },
  { title: 'Custom RAG Pipeline', meta: 'EXCHANGE · Dataset + Model', category: 'DATASET', color: 'violet', href: '#' },
  { title: 'ChatGPT API Wrapper', meta: 'EXCHANGE · Integration', category: 'MODEL', color: 'violet', href: '#' },
  // NeuralWork
  { title: 'AI Developer for Hire', meta: 'NEURALWORK · Verified Talent', category: 'TALENT', color: 'emerald', href: '#' },
  { title: 'ML Engineer — Remote', meta: 'NEURALWORK · Specialist', category: 'TALENT', color: 'emerald', href: '#' },
  { title: 'Prompt Engineer', meta: 'NEURALWORK · On-demand', category: 'TALENT', color: 'emerald', href: '#' },
  { title: 'Fine-tuning Specialist', meta: 'NEURALWORK · LLM Expert', category: 'TALENT', color: 'emerald', href: '#' },
  // AXIS
  { title: 'GPT-4o Benchmark', meta: 'AXIS · Model Intelligence', category: 'INTEL', color: 'amber', href: '#' },
  { title: 'Claude 3.5 Sonnet', meta: 'AXIS · Compare & Track', category: 'INTEL', color: 'amber', href: '#' },
  { title: 'Gemini Ultra Ranking', meta: 'AXIS · Leaderboard', category: 'INTEL', color: 'amber', href: '#' },
  { title: 'Mistral 7B Analysis', meta: 'AXIS · Open Source', category: 'INTEL', color: 'amber', href: '#' },
];

const COLOR_MAP = {
  cyan:    { bg: 'rgba(6,182,212,0.1)',   color: '#06B6D4',  border: 'rgba(6,182,212,0.2)'  },
  violet:  { bg: 'rgba(124,58,237,0.1)',  color: '#7C3AED',  border: 'rgba(124,58,237,0.2)' },
  emerald: { bg: 'rgba(5,150,105,0.1)',   color: '#059669',  border: 'rgba(5,150,105,0.2)'  },
  amber:   { bg: 'rgba(217,119,6,0.1)',   color: '#D97706',  border: 'rgba(217,119,6,0.2)'  },
};

function showSearchDropdown() {
  const dd = document.getElementById('search-dropdown');
  if (!dd) return;
  const val = document.getElementById('search-input').value.trim();
  // Show popular if empty, show results if typing
  const popular = document.getElementById('search-popular');
  if (val.length === 0) {
    if (popular) popular.style.display = '';
    document.getElementById('search-results').innerHTML = '';
  }
  dd.style.display = 'block';
}

function hideSearchDropdown() {
  const dd = document.getElementById('search-dropdown');
  if (dd) dd.style.display = 'none';
}

function handleSearchInput(e) {
  const val = e.target.value.trim().toLowerCase();
  const resultsEl = document.getElementById('search-results');
  const popularEl = document.getElementById('search-popular');
  const dd = document.getElementById('search-dropdown');
  if (!resultsEl || !dd) return;

  dd.style.display = 'block';

  if (val.length === 0) {
    if (popularEl) popularEl.style.display = '';
    resultsEl.innerHTML = '';
    return;
  }

  if (popularEl) popularEl.style.display = 'none';

  const matches = SEARCH_DATA.filter(item =>
    item.title.toLowerCase().includes(val) ||
    item.meta.toLowerCase().includes(val) ||
    item.category.toLowerCase().includes(val)
  ).slice(0, 6);

  if (matches.length === 0) {
    resultsEl.innerHTML = `<div style="padding:1rem;text-align:center;color:var(--text-faint);font-size:0.82rem">No results for "${e.target.value}" — try a different term</div>`;
    return;
  }

  resultsEl.innerHTML = matches.map(item => {
    const c = COLOR_MAP[item.color] || COLOR_MAP.cyan;
    return `
      <div class="search-result-item" onclick="fillSearch('${item.title}')">
        <div class="search-result-icon" style="background:${c.bg};color:${c.color};border:1px solid ${c.border}">${item.category.slice(0,3)}</div>
        <div class="search-result-text">
          <div class="search-result-title">${item.title}</div>
          <div class="search-result-meta">${item.meta}</div>
        </div>
        <span class="search-result-tag" style="background:${c.bg};color:${c.color};border:1px solid ${c.border}">${item.category}</span>
      </div>
    `;
  }).join('');
}

function handleSearch(e) {
  if (e.key === 'Enter') handleSearchClick();
  if (e.key === 'Escape') hideSearchDropdown();
}

function handleSearchClick() {
  const val = document.getElementById('search-input').value.trim();
  hideSearchDropdown();
  if (!val) return;
  openSignUp();
}

function fillSearch(text) {
  const input = document.getElementById('search-input');
  if (!input) return;
  input.value = text;
  input.focus();
  handleSearchInput({ target: input });
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  const wrap = document.getElementById('search-wrap');
  if (wrap && !wrap.contains(e.target)) hideSearchDropdown();
});

// ============================================================
//  WAITLIST MODAL
// ============================================================
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

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const waitlist = document.getElementById('itara-modal');
  const signin   = document.getElementById('signin-overlay');
  const signup   = document.getElementById('signup-overlay');
  if (waitlist && waitlist.style.display !== 'none') closeModal();
  if (signin   && signin.style.display   !== 'none') closeSignIn();
  if (signup   && signup.style.display   !== 'none') closeSignUp();
});

function toggleChip(btn) {
  btn.classList.toggle('active');
  const selected = [...document.querySelectorAll('.chip.active')].map(b => b.dataset.value);
  const hidden = document.getElementById('m-interests');
  if (hidden) hidden.value = selected.join(', ');
}

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
//  SIGN IN MODAL
// ============================================================
function openSignIn() {
  // Reset state
  const formWrap    = document.getElementById('signin-form-wrap');
  const successWrap = document.getElementById('signin-success');
  const form        = document.getElementById('signin-form');
  const errBox      = document.getElementById('signin-error');
  if (formWrap)    formWrap.style.display    = '';
  if (successWrap) successWrap.style.display = 'none';
  if (form)        form.reset();
  if (errBox)      errBox.style.display      = 'none';

  const overlay = document.getElementById('signin-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    const emailInput = document.getElementById('signin-email');
    if (emailInput) emailInput.focus();
  }, 50);
}

function closeSignIn() {
  const overlay = document.getElementById('signin-overlay');
  if (!overlay) return;
  overlay.style.display = 'none';
  document.body.style.overflow = '';
}

function switchToSignUp() {
  closeSignIn();
  openSignUp();
}

function switchToSignIn() {
  closeSignUp();
  openSignIn();
}

// Password toggle — generic, works for any pair
function togglePw(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon  = document.getElementById(iconId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
  } else {
    input.type = 'password';
    if (icon) icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  }
}

// Sign In with Google
async function signInWithGoogle() {
  const base = window.location.hostname === 'localhost'
    ? window.location.origin
    : 'https://www.itara.ai';
  const { error } = await supa.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: base + '/index.html?signin_step=1'
    }
  });
  if (error) {
    const errBox = document.getElementById('signin-error');
    if (errBox) {
      errBox.textContent = error.message || 'Google sign-in failed.';
      errBox.style.display = 'block';
    }
  }
}

// Sign In with email/password
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

// ============================================================
//  SIGN UP MODAL + 4-STEP ONBOARDING
// ============================================================

// State
let _signupStep     = 0;
let _signupViaGoogle = false;
let _signupUsername = '';
let _selectedInterests = [];
let _selectedGender    = '';

// Username generation
function generateUsername(name) {
  const base = (name || 'itara_user')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 12);
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return base + suffix;
}

function rerollUsername() {
  const u = generateUsername('user');
  const input = document.getElementById('su-username');
  if (input) input.value = u;
  _signupUsername = u;
}

function updateUsername(input) {
  _signupUsername = input.value;
}

function openSignUp() {
  // Reset all state
  _signupStep      = 0;
  _signupViaGoogle = false;
  _signupUsername  = generateUsername('user');
  _selectedInterests = [];
  _selectedGender    = '';

  // Reset UI
  resetSignUpUI();

  const overlay = document.getElementById('signup-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeSignUp() {
  const overlay = document.getElementById('signup-overlay');
  if (!overlay) return;
  overlay.style.display = 'none';
  document.body.style.overflow = '';
}

function resetSignUpUI() {
  // Hide all steps, show step 0
  document.querySelectorAll('.signup-step').forEach(s => s.classList.remove('active'));
  const step0 = document.getElementById('signup-step-0');
  if (step0) step0.classList.add('active');

  // Reset progress dots
  updateProgressDots(0);

  // Clear forms
  const emailInput = document.getElementById('su-email');
  const pwInput    = document.getElementById('su-password');
  if (emailInput) emailInput.value = '';
  if (pwInput)    pwInput.value    = '';

  // Clear error
  const errBox = document.getElementById('su-email-error');
  if (errBox) errBox.style.display = 'none';

  // Reset username field
  const unInput = document.getElementById('su-username');
  if (unInput) unInput.value = _signupUsername;

  // Reset interests
  document.querySelectorAll('.interest-btn').forEach(b => b.classList.remove('active'));
  _selectedInterests = [];
  updateInterestsCounter();

  // Reset gender
  document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
  _selectedGender = '';

  // Reset T&C
  const toc = document.getElementById('su-toc');
  if (toc) toc.checked = false;
  const launchBtn = document.getElementById('su-launch-btn');
  if (launchBtn) launchBtn.disabled = true;

  // Reset avatar
  const avatarEl = document.getElementById('su-avatar-preview');
  if (avatarEl) {
    avatarEl.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  }
}

function updateProgressDots(currentStep) {
  // Progress dots only shown for steps 1-4 (onboarding steps)
  const dots = document.querySelectorAll('.prog-dot');
  const progress = document.getElementById('signup-progress');

  // Show/hide progress bar (not needed on step 0)
  if (progress) {
    progress.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
  }

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentStep - 1);
  });
}

function goSignUpStep(step) {
  const current = document.getElementById('signup-step-' + _signupStep);
  const next    = document.getElementById('signup-step-' + step);
  if (!next) return;

  if (current) current.classList.remove('active');
  next.classList.add('active');
  _signupStep = step;

  updateProgressDots(step);

  // Set username on step 1
  if (step === 1) {
    const input = document.getElementById('su-username');
    if (input && !input.value) input.value = _signupUsername;
    const googleNote = document.getElementById('su-google-note');
    if (googleNote) googleNote.style.display = _signupViaGoogle ? 'flex' : 'none';
  }

  // Scroll card to top
  const card = document.querySelector('.auth-card-signup');
  if (card) card.scrollTop = 0;
}

// Sign Up with Google
async function signUpWithGoogle() {
  _signupViaGoogle = true;
  const base = window.location.hostname === 'localhost'
    ? window.location.origin
    : 'https://www.itara.ai';
  const { error } = await supa.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: base + '/index.html?signup_step=1'
    }
  });
  if (error) {
    const errBox = document.getElementById('su-email-error');
    if (errBox) {
      errBox.textContent = error.message || 'Google sign-up failed.';
      errBox.style.display = 'block';
    }
  }
}

// Sign Up with email — create account then continue to step 1
async function submitSignUpEmail(e) {
  e.preventDefault();
  const email   = document.getElementById('su-email').value.trim();
  const pw      = document.getElementById('su-password').value;
  const btn     = document.getElementById('su-email-btn');
  const btnText = document.getElementById('su-email-btn-text');
  const spinner = document.getElementById('su-email-spinner');
  const errBox  = document.getElementById('su-email-error');

  btn.disabled = true;
  btnText.textContent = 'Creating account…';
  spinner.style.display = 'block';
  errBox.style.display  = 'none';

  const { data, error } = await supa.auth.signUp({ email, password: pw });

  spinner.style.display = 'none';
  btn.disabled = false;
  btnText.textContent = 'Continue';

  if (error) {
    errBox.textContent = error.message || 'Sign-up failed. Please try again.';
    errBox.style.display = 'block';
    return;
  }

  // Account created — continue to onboarding step 1
  goSignUpStep(1);
}

// Interest selection
function toggleInterest(btn) {
  const val = btn.dataset.interest;
  if (btn.classList.contains('active')) {
    btn.classList.remove('active');
    _selectedInterests = _selectedInterests.filter(i => i !== val);
  } else {
    btn.classList.add('active');
    _selectedInterests.push(val);
  }
  updateInterestsCounter();
}

function updateInterestsCounter() {
  const count = _selectedInterests.length;
  const counter = document.getElementById('interests-count');
  if (counter) counter.textContent = count + '/3';

  const btn = document.getElementById('interests-continue-btn');
  if (btn) btn.disabled = count < 3;
}

// Gender selection
function selectGender(btn) {
  document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  _selectedGender = btn.dataset.gender;
}

// Avatar preview
function previewAvatar(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const avatarEl = document.getElementById('su-avatar-preview');
    if (avatarEl) {
      avatarEl.innerHTML = '<img src="' + e.target.result + '" alt="Avatar" />';
    }
  };
  reader.readAsDataURL(file);
}

// Greeting on step 1
function updateGreeting(name) {
  const el = document.getElementById('su-greeting');
  if (el) el.textContent = 'Hey, ' + (name || 'there') + '! 👋';
}

// T&C toggle enables launch button
function updateLaunchBtn() {
  const toc = document.getElementById('su-toc');
  const btn = document.getElementById('su-launch-btn');
  if (btn) btn.disabled = !(toc && toc.checked);
}

// Final: launch account
async function launchAccount() {
  const btn     = document.getElementById('su-launch-btn');
  const btnText = document.getElementById('su-launch-text');
  const spinner = document.getElementById('su-launch-spinner');
  const errBox  = document.getElementById('su-final-error');

  btn.disabled = true;
  btnText.textContent = 'Launching…';
  spinner.style.display = 'block';
  errBox.style.display  = 'none';

  try {
    // Get current session
    const { data: { session } } = await supa.auth.getSession();

    if (session) {
      // Update user metadata with onboarding info
      await supa.auth.updateUser({
        data: {
          username:   _signupUsername || generateUsername('user'),
          gender:     _selectedGender,
          interests:  _selectedInterests,
          onboarding_complete: true
        }
      });
    }

    // Show success
    spinner.style.display = 'none';
    goSignUpStep(5);
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 2000);

  } catch (err) {
    spinner.style.display = 'none';
    btn.disabled = false;
    btnText.textContent = '🚀 Launch my account';
    errBox.textContent = err.message || 'Something went wrong. Please try again.';
    errBox.style.display = 'block';
  }
}

// ============================================================
//  CHECK FOR GOOGLE OAUTH RETURN (signup_step=1 or signin_step=1)
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);

  if (params.get('signup_step') === '1') {
    // Returned from Google OAuth during sign-up flow
    const { data: { session } } = await supa.auth.getSession();
    if (session) {
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);

      // Open signup overlay at step 1 with Google flag
      _signupViaGoogle = true;
      _signupUsername  = generateUsername(
        session.user.user_metadata?.full_name || session.user.email
      );

      openSignUp();
      // Immediately jump to step 1 (skip email/password step)
      setTimeout(() => {
        goSignUpStep(1);
        const greeting = document.getElementById('su-greeting');
        const name = session.user.user_metadata?.full_name?.split(' ')[0] || 'there';
        if (greeting) greeting.textContent = 'Hey, ' + name + '! 👋';
      }, 50);
    }
  }

  if (params.get('signin_step') === '1') {
    // Returned from Google OAuth during sign-in flow
    const { data: { session } } = await supa.auth.getSession();
    if (session) {
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
      // Redirect to dashboard after successful OAuth sign-in
      window.location.href = '/dashboard.html';
    }
  }
});

// ============================================================
//  FADE IN CARDS ON SCROLL
// ============================================================
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
