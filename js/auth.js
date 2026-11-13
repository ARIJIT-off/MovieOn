// ═══════════════════════════════════════════════════════════════
// MOViEON — Auth Module v2.0
// OTP-based login for Admin & User roles
// ═══════════════════════════════════════════════════════════════

const API_BASE = 'http://localhost:4000';

// Global session state
const session = {
  role: null,         // 'admin' | 'user'
  email: null,
  phone: null,
  name: null,
  isLoggedIn: false
};

let currentAuthRole = 'user'; // Active tab
let otpSentEmail = '';

// ── Tab Switching ─────────────────────────────────────────────
function switchAuthTab(role) {
  currentAuthRole = role;

  // Update tab UI
  document.getElementById('tab-user').classList.toggle('auth-tab--active', role === 'user');
  document.getElementById('tab-admin').classList.toggle('auth-tab--active', role === 'admin');

  // Update label
  document.getElementById('auth-role-label').textContent = role === 'admin' ? 'Sign in as Admin' : 'Sign in as User';

  // Reset form
  backToEmail();
  clearAuthError();
}

// ── Send OTP ──────────────────────────────────────────────────
async function sendOTP() {
  const emailInput = document.getElementById('auth-email-input');
  const email = emailInput.value.trim();

  if (!email || !email.includes('@')) {
    showAuthError('Please enter a valid email address.');
    return;
  }

  setOTPBtnLoading(true);
  clearAuthError();

  try {
    const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role: currentAuthRole })
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.error === 'not_registered') {
        showAuthError('⚠️ Your email id is not registered');
      } else {
        showAuthError(data.message || data.error || 'Failed to send OTP.');
      }
      return;
    }

    // Success — show OTP input step
    otpSentEmail = email;
    showOTPStep(email);

  } catch (err) {
    showAuthError('Could not connect to server. Make sure the backend is running.');
    console.error(err);
  } finally {
    setOTPBtnLoading(false);
  }
}

// ── Verify OTP ────────────────────────────────────────────────
async function verifyOTP() {
  const otp = getOTPValue();

  if (otp.length < 4) {
    showAuthError('Please enter the 4-digit OTP.');
    return;
  }

  setVerifyBtnLoading(true);
  clearAuthError();

  try {
    const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: otpSentEmail, otp, role: currentAuthRole })
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.error === 'not_registered') {
        showAuthError('⚠️ Your email id is not registered');
      } else if (data.error === 'invalid_otp') {
        showAuthError('Invalid or expired OTP. Please try again.');
        clearOTPBoxes();
      } else {
        showAuthError(data.message || 'Verification failed.');
      }
      return;
    }

    // ✅ Login success
    session.role = data.role;
    session.email = data.email;
    session.phone = data.phone || null;
    session.name = data.name || null;
    session.isLoggedIn = true;

    // Persist session to localStorage so hard refresh doesn't log out
    try {
      localStorage.setItem('movieon_session', JSON.stringify({
        role: session.role,
        email: session.email,
        phone: session.phone,
        name: session.name,
        isLoggedIn: true
      }));
    } catch (e) {
      console.warn('Could not save session to localStorage:', e);
    }

    onLoginSuccess();

  } catch (err) {
    showAuthError('Could not connect to server.');
    console.error(err);
  } finally {
    setVerifyBtnLoading(false);
  }
}

// ── On Login Success ──────────────────────────────────────────
function onLoginSuccess() {
  // Hide auth page, show main app
  document.getElementById('auth-page').classList.add('hidden');
  document.getElementById('main-app').classList.remove('hidden');

  // Setup header based on role
  if (session.role === 'admin') {
    // Admin nav
    document.getElementById('nav-bookings').classList.remove('hidden');
    document.getElementById('nav-admins').classList.remove('hidden');
    document.getElementById('header-profile').classList.add('hidden');
    // Admin home = bookings view
    navigate('admin-bookings');
  } else {
    // User nav
    document.getElementById('nav-bookings').classList.add('hidden');
    document.getElementById('nav-admins').classList.add('hidden');
    document.getElementById('header-profile').classList.remove('hidden');

    // Set profile button
    const short = session.email.split('@')[0];
    document.getElementById('profile-email-short').textContent = short;
    document.getElementById('profile-avatar').textContent = short[0].toUpperCase();

    // Set profile panel email
    document.getElementById('pp-email').textContent = session.email;
    document.getElementById('pp-phone').textContent = session.phone || 'NA';

    navigate('home');
  }

  // Init background canvas
  if (typeof initBackgroundCanvas === 'function') initBackgroundCanvas();
  if (typeof initTheatreInfo === 'function') initTheatreInfo();
}

// ── Logout ────────────────────────────────────────────────────
function logout() {
  session.role = null;
  session.email = null;
  session.isLoggedIn = false;

  // Clear persisted session
  try {
    localStorage.removeItem('movieon_session');
  } catch (e) {
    console.warn('Could not clear session from localStorage:', e);
  }

  // Reset state if exists
  if (typeof state !== 'undefined') {
    state.userEmail = '';
    state.userMobile = '';
    state.userName = '';
  }

  document.getElementById('main-app').classList.add('hidden');
  document.getElementById('auth-page').classList.remove('hidden');

  // Reset form
  backToEmail();
  document.getElementById('auth-email-input').value = '';
  switchAuthTab('user');
  clearAuthError();
}

// ── OTP UI Helpers ────────────────────────────────────────────
function showOTPStep(email) {
  document.getElementById('auth-step-email').classList.add('hidden');
  document.getElementById('auth-step-otp').classList.remove('hidden');
  document.getElementById('auth-otp-hint').textContent = `A 4-digit OTP has been sent to ${email}`;
  clearOTPBoxes();
  setTimeout(() => document.getElementById('otp-0').focus(), 100);
}

function backToEmail() {
  document.getElementById('auth-step-email').classList.remove('hidden');
  document.getElementById('auth-step-otp').classList.add('hidden');
  clearOTPBoxes();
  clearAuthError();
}

function getOTPValue() {
  return [0,1,2,3].map(i => document.getElementById(`otp-${i}`).value).join('');
}

function clearOTPBoxes() {
  [0,1,2,3].forEach(i => {
    const box = document.getElementById(`otp-${i}`);
    box.value = '';
    box.classList.remove('filled');
  });
}

function otpInput(index) {
  const box = document.getElementById(`otp-${index}`);
  const val = box.value.replace(/\D/g, '');
  box.value = val ? val[val.length - 1] : '';
  box.classList.toggle('filled', box.value !== '');

  if (box.value && index < 3) {
    document.getElementById(`otp-${index + 1}`).focus();
  }

  // Auto-verify when all 4 filled
  if (getOTPValue().length === 4) {
    setTimeout(verifyOTP, 150);
  }
}

function otpKeydown(event, index) {
  if (event.key === 'Backspace' && !document.getElementById(`otp-${index}`).value && index > 0) {
    document.getElementById(`otp-${index - 1}`).focus();
  }
  if (event.key === 'Enter') verifyOTP();
}

// ── Button loading states ─────────────────────────────────────
function setOTPBtnLoading(loading) {
  const btn = document.getElementById('auth-send-otp-btn');
  const label = document.getElementById('auth-send-otp-label');
  const spinner = document.getElementById('auth-send-otp-spinner');
  btn.disabled = loading;
  label.textContent = loading ? 'Sending...' : 'Send OTP';
  spinner.classList.toggle('hidden', !loading);
}

function setVerifyBtnLoading(loading) {
  const btn = document.getElementById('auth-verify-btn');
  const label = document.getElementById('auth-verify-label');
  const spinner = document.getElementById('auth-verify-spinner');
  btn.disabled = loading;
  label.textContent = loading ? 'Verifying...' : 'Verify & Login';
  spinner.classList.toggle('hidden', !loading);
}

// ── Error display ─────────────────────────────────────────────
function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

function clearAuthError() {
  const el = document.getElementById('auth-error');
  if (el) {
    el.textContent = '';
    el.classList.add('hidden');
  }
}

// ── Profile Panel ─────────────────────────────────────────────
function toggleProfilePanel() {
  const panel = document.getElementById('profile-panel');
  const isHidden = panel.classList.contains('hidden');
  panel.classList.toggle('hidden');
  if (isHidden) {
    loadUserOrders();
  }
}

async function loadUserOrders() {
  const list = document.getElementById('pp-orders-list');
  // Skeleton loader while fetching
  list.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px;">
      ${Array.from({length:3}, () => `
        <div style="padding:12px;border:1px solid rgba(255,255,255,0.08);border-radius:4px;">
          <div class="skeleton skeleton-line skeleton-line--medium" style="margin-bottom:8px;"></div>
          <div class="skeleton skeleton-line skeleton-line--full" style="height:11px;margin-bottom:6px;"></div>
          <div class="skeleton skeleton-line skeleton-line--short" style="height:11px;"></div>
        </div>
      `).join('')}
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE}/api/bookings/user?email=${encodeURIComponent(session.email)}`);
    const bookings = await res.json();

    if (!bookings.length) {
      list.innerHTML = '<div class="profile-orders-loading">No bookings yet 🎬</div>';
      return;
    }

    list.innerHTML = bookings.map(b => `
      <div class="profile-order-card">
        <div class="profile-order-movie">${b.movieName}</div>
        <div class="profile-order-meta">
          ${b.date} &nbsp;&bull;&nbsp; ${b.showtime}<br>
          ${b.audiName} &nbsp;&bull;&nbsp; ${b.seats.join(', ')}<br>
          Rs.${b.grandTotal}
        </div>
        <button class="profile-order-ticket-btn" onclick="showTicketModal('${b.bookingId}')">
          View &amp; Download Ticket
        </button>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = '<div class="profile-orders-loading">Failed to load bookings.</div>';
  }
}

// ── Ticket Modal ──────────────────────────────────────────────
async function showTicketModal(bookingId) {
  try {
    const res = await fetch(`${API_BASE}/api/ticket/qr?bookingId=${encodeURIComponent(bookingId)}`);
    const data = await res.json();

    if (!data.booking) {
      showToast('Ticket not found', 'error');
      return;
    }

    const b = data.booking;
    const overlay = document.createElement('div');
    overlay.className = 'ticket-modal-overlay';
    overlay.id = 'ticket-modal-overlay';
    overlay.innerHTML = `
      <div class="ticket-modal">
        <button class="ticket-modal__close" onclick="closeTicketModal()">✕</button>
        <div class="ticket-modal__title">${b.movieName}</div>
        <div class="ticket-modal__sub">${b.audiName} &nbsp;•&nbsp; ${b.date} &nbsp;•&nbsp; ${b.showtime}</div>
        <div class="ticket-qr-wrap">
          <div id="ticket-qr-canvas"></div>
        </div>
        <div class="ticket-info">
          <strong>Booking ID:</strong> ${b.bookingId}<br>
          <strong>Seats:</strong> ${b.seats.join(', ')}<br>
          <strong>Amount Paid:</strong> ₹${b.grandTotal}<br>
          <strong>Email:</strong> ${b.bookedByEmail}
        </div>
        <button class="ticket-download-btn" onclick="downloadTicket('${b.bookingId}', '${b.movieName}')">
          Download Ticket
        </button>
      </div>
    `;
    document.body.appendChild(overlay);

    // Generate QR
    new QRCode(document.getElementById('ticket-qr-canvas'), {
      text: data.booking.qrData || bookingId,
      width: 160,
      height: 160,
      colorDark: '#000',
      colorLight: '#fff'
    });

  } catch (err) {
    showToast('Failed to load ticket', 'error');
    console.error(err);
  }
}

function closeTicketModal() {
  const overlay = document.getElementById('ticket-modal-overlay');
  if (overlay) overlay.remove();
}

function downloadTicket(bookingId, movieName) {
  const qrCanvas = document.querySelector('#ticket-qr-canvas canvas');
  if (!qrCanvas) return;

  const link = document.createElement('a');
  link.download = `ticket_${bookingId}.png`;
  link.href = qrCanvas.toDataURL('image/png');
  link.click();
  showToast('Ticket downloaded!', 'success');
}

// ── Init background canvas and session restore ───────────────
document.addEventListener('DOMContentLoaded', () => {
  // Check for saved session in localStorage
  try {
    const saved = localStorage.getItem('movieon_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.isLoggedIn && parsed.email) {
        session.role = parsed.role || 'user';
        session.email = parsed.email;
        session.phone = parsed.phone || null;
        session.name = parsed.name || null;
        session.isLoggedIn = true;
        onLoginSuccess();
      }
    }
  } catch (e) {
    console.warn('Could not restore session:', e);
  }

  // Start background canvas
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const stars = Array.from({length: 120}, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5,
      o: Math.random() * 0.5 + 0.1
    }));
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 2*Math.PI);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.o})`;
        ctx.fill();
      });
    }
    draw();
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    });
  }

  // Keyboard shortcut on email step
  document.getElementById('auth-email-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendOTP();
  });
});
