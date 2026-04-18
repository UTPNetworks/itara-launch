// === NAV SCROLL BEHAVIOR ===
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// === DARK MODE TOGGLE ===
(function () {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = 'light';
  root.setAttribute('data-theme', theme);

  if (toggle) {
    toggle.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      toggle.innerHTML = theme === 'dark'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
    });
  }
})();

// === MODAL STATE ===
let _prefillEmail = '';

function openModal() {
  const modal = document.getElementById('itara-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  // Pre-fill email if captured from hero form
  if (_prefillEmail) {
    const emailInput = document.getElementById('m-email');
    if (emailInput) emailInput.value = _prefillEmail;
    _prefillEmail = '';
  }
  // Focus first field
  setTimeout(() => {
    const first = document.getElementById('m-firstname');
    if (first) first.focus();
  }, 300);
}

function openModalWithEmail(e) {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  if (input && input.value) _prefillEmail = input.value.trim();
  openModal();
}

function closeModal() {
  const modal = document.getElementById('itara-modal');
  if (!modal) return;
  modal.style.opacity = '0';
  modal.style.transition = 'opacity 0.2s ease';
  setTimeout(() => {
    modal.style.display = 'none';
    modal.style.opacity = '';
    modal.style.transition = '';
    document.body.style.overflow = '';
    // Reset form state
    resetModal();
  }, 200);
}

function resetModal() {
  const form = document.getElementById('itara-waitlist-form');
  const success = document.getElementById('modal-success');
  if (form) { form.style.display = 'flex'; form.reset(); }
  if (success) success.style.display = 'none';
  // Deselect all chips
  document.querySelectorAll('.interest-chip.selected').forEach(c => c.classList.remove('selected'));
  // Reset submit button
  const btnText = document.getElementById('modal-btn-text');
  const btnArrow = document.getElementById('modal-btn-arrow');
  const btnSpinner = document.getElementById('modal-btn-spinner');
  const submitBtn = document.getElementById('modal-submit-btn');
  if (btnText) btnText.textContent = 'Secure My Spot';
  if (btnArrow) btnArrow.style.display = '';
  if (btnSpinner) btnSpinner.style.display = 'none';
  if (submitBtn) submitBtn.disabled = false;
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('itara-modal');
    if (modal && modal.style.display !== 'none') closeModal();
  }
});

// === INTEREST CHIPS ===
function toggleChip(chip) {
  chip.classList.toggle('selected');
  // Update hidden input with all selected values
  const selected = Array.from(document.querySelectorAll('.interest-chip.selected'))
    .map(c => c.dataset.value);
  const hiddenInput = document.getElementById('m-interests');
  if (hiddenInput) hiddenInput.value = selected.join(', ');
}

// === MODAL FORM SUBMIT (Formspree) ===
async function submitModal(e) {
  e.preventDefault();

  const firstName  = document.getElementById('m-firstname').value.trim();
  const lastName   = document.getElementById('m-lastname').value.trim();
  const email      = document.getElementById('m-email').value.trim();
  const interests  = document.getElementById('m-interests').value || 'Not specified';

  if (!firstName || !lastName || !email) return;

  // UI — loading state
  const btnText    = document.getElementById('modal-btn-text');
  const btnArrow   = document.getElementById('modal-btn-arrow');
  const btnSpinner = document.getElementById('modal-btn-spinner');
  const submitBtn  = document.getElementById('modal-submit-btn');

  btnText.textContent = 'Submitting...';
  btnArrow.style.display = 'none';
  btnSpinner.style.display = 'block';
  submitBtn.disabled = true;

  try {
    // Formspree endpoint — sends email to admin@itara.ai
    const response = await fetch('https://formspree.io/f/mgorkqyk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        first_name:  firstName,
        last_name:   lastName,
        email:       email,
        interests:   interests,
        _subject:    `New Itara Waitlist Signup — ${firstName} ${lastName}`,
        _replyto:    email
      })
    });

    if (response.ok) {
      // Show success
      const form    = document.getElementById('itara-waitlist-form');
      const success = document.getElementById('modal-success');
      form.style.display    = 'none';
      success.style.display = 'block';

      // Update waitlist counter on the page
      waitlistCount++;
      const note = document.getElementById('waitlist-msg');
      if (note) {
        note.innerHTML = `🎉 You're in! <strong>${waitlistCount.toLocaleString()}+</strong> builders and counting.`;
      }
    } else {
      throw new Error('Submission failed');
    }
  } catch (err) {
    // Fallback — still show success (don't block the user experience)
    const form    = document.getElementById('itara-waitlist-form');
    const success = document.getElementById('modal-success');
    form.style.display    = 'none';
    success.style.display = 'block';

    // Reset button state
    btnText.textContent = 'Secure My Spot';
    btnArrow.style.display = '';
    btnSpinner.style.display = 'none';
    submitBtn.disabled = false;
  }
}

// === WAITLIST COUNT (for inline forms) ===
let waitlistCount = 2400;

// === INTERSECTION OBSERVER — FADE IN SECTIONS ===
const fadeEls = document.querySelectorAll('.module-card, .market-card, .comm-card, .stat, .tam-item');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease, border-color 180ms cubic-bezier(0.16,1,0.3,1), box-shadow 180ms cubic-bezier(0.16,1,0.3,1)';
  observer.observe(el);
});

// ============================================================
//  SUPABASE AUTH
// ============================================================
const SUPA_URL  = 'https://pduogjyvgvpgxdzxdrqx.supabase.co';
const SUPA_KEY  = 'sb_publishable_ahLDuaB1GT9wOxgg4ZCHng_lBQ9hc4L';
const { createClient } = supabase;
const supa = createClient(SUPA_URL, SUPA_KEY);

// --- Modal open / close ---
function openSignIn() {
  const overlay = document.getElementById('signin-overlay');
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  setTimeout(() => { overlay.classList.add('modal-visible'); }, 10);
  document.getElementById('signin-email').focus();
}

function closeSignIn(e) {
  if (e && e.target !== document.getElementById('signin-overlay')) return;
  const overlay = document.getElementById('signin-overlay');
  overlay.classList.remove('modal-visible');
  setTimeout(() => {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    // reset form on close
    document.getElementById('signin-form').reset();
    document.getElementById('signin-error').style.display = 'none';
    document.getElementById('signin-form-wrap').style.display = '';
    document.getElementById('signin-success').style.display = 'none';
  }, 250);
}

// ESC key closes modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const overlay = document.getElementById('signin-overlay');
    if (overlay && overlay.style.display !== 'none') closeSignIn();
  }
});

// --- Password visibility toggle ---
function togglePw() {
  const input = document.getElementById('signin-password');
  const icon  = document.getElementById('pw-eye');
  if (input.type === 'password') {
    input.type = 'text';
    icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
  } else {
    input.type = 'password';
    icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  }
}

// --- Sign in submit ---
async function submitSignIn(e) {
  e.preventDefault();
  const email    = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;
  const btn      = document.getElementById('signin-btn');
  const btnText  = document.getElementById('signin-btn-text');
  const spinner  = document.getElementById('signin-spinner');
  const errBox   = document.getElementById('signin-error');

  // Loading state
  btn.disabled   = true;
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

  // Success — show success state then redirect
  document.getElementById('signin-form-wrap').style.display = 'none';
  document.getElementById('signin-success').style.display   = 'flex';
  setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
}
