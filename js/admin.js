// ═══════════════════════════════════════════════════════════════
// MOViEON — Admin Panel Module
// Manage admins, view bookings, download XLSX
// ═══════════════════════════════════════════════════════════════

let adminBookingPeriod = 'upcoming'; // current tab

// ── Admin Bookings View ───────────────────────────────────────
async function renderAdminBookings() {
  const content = document.getElementById('app-content');
  document.getElementById('sidebar').style.display = 'none';
  document.getElementById('step-nav-back').classList.add('step-nav--hidden');
  document.getElementById('step-nav-next').classList.add('step-nav--hidden');

  content.innerHTML = `
    <div class="admin-panel">
      <div class="admin-panel__title">📋 Bookings Dashboard</div>
      <div class="admin-panel__sub">View and export all ticket bookings</div>

      <div class="admin-section">
        <div class="admin-section__header">
          <div class="admin-booking-tabs">
            <button class="admin-booking-tab admin-booking-tab--active" id="tab-upcoming" onclick="switchAdminBookingTab('upcoming')">
              🗓 Yet to Come
            </button>
            <button class="admin-booking-tab" id="tab-previous" onclick="switchAdminBookingTab('previous')">
              ⏮ Previous
            </button>
          </div>
          <button class="admin-download-btn" onclick="downloadBookingsXLSX()">
            ⬇ Download .xlsx
          </button>
        </div>

        <div id="admin-bookings-content">
          <div class="admin-empty">Loading bookings...</div>
        </div>
      </div>
    </div>
  `;

  loadAdminBookings('upcoming');
}

async function switchAdminBookingTab(period) {
  adminBookingPeriod = period;
  document.getElementById('tab-upcoming').classList.toggle('admin-booking-tab--active', period === 'upcoming');
  document.getElementById('tab-previous').classList.toggle('admin-booking-tab--active', period === 'previous');
  await loadAdminBookings(period);
}

// Helper to resolve snack name by id
function getSnackDisplayName(id) {
  if (typeof getFoodItemById === 'function') {
    const item = getFoodItemById(id);
    if (item && item.name) return item.name;
  }
  return id;
}

// Helper to resolve hall / audi name and label (e.g., "Audi 1 STD", "Audi 2 STD+", "Audi 3 REC")
function getAudiDisplayLabel(b) {
  if (b.audiId && typeof SCREENS !== 'undefined') {
    const scr = SCREENS.find(s => s.id === Number(b.audiId));
    if (scr) return `${scr.name} ${scr.label || ''}`.trim();
  }
  if (b.audiName) {
    if (typeof SCREENS !== 'undefined') {
      const scr = SCREENS.find(s => s.name.toLowerCase() === b.audiName.toLowerCase());
      if (scr) return `${scr.name} ${scr.label || ''}`.trim();
    }
    return b.audiName;
  }
  return 'Audi 1 STD';
}

async function loadAdminBookings(period) {
  const container = document.getElementById('admin-bookings-content');
  // Show skeleton rows while fetching
  container.innerHTML = `
    <div style="padding:8px 0;">
      ${Array.from({length:5}, () => `
        <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <div class="skeleton skeleton-line" style="width:80px;height:13px;flex-shrink:0;"></div>
          <div class="skeleton skeleton-line" style="width:160px;height:13px;flex-shrink:0;"></div>
          <div class="skeleton skeleton-line" style="width:70px;height:13px;flex-shrink:0;"></div>
          <div class="skeleton skeleton-line" style="width:80px;height:13px;flex-shrink:0;"></div>
          <div class="skeleton skeleton-line" style="width:80px;height:13px;flex-shrink:0;"></div>
          <div class="skeleton skeleton-line" style="width:140px;height:13px;flex-shrink:0;"></div>
          <div class="skeleton skeleton-line" style="width:120px;height:13px;flex-shrink:0;"></div>
          <div class="skeleton skeleton-line" style="width:60px;height:13px;flex-shrink:0;"></div>
        </div>
      `).join('')}
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE}/api/admin/bookings?period=${period}`);
    const bookings = await res.json();

    if (!bookings.length) {
      container.innerHTML = `<div class="admin-empty">No ${period === 'upcoming' ? 'upcoming' : 'previous'} bookings found.</div>`;
      return;
    }

    const rows = bookings.map(b => {
      // Format food items with friendly snack names
      const snacks = Object.entries(b.foodItems || {})
        .filter(([,qty]) => qty > 0)
        .map(([id, qty]) => `${getSnackDisplayName(id)} (${qty})`)
        .join(', ') || '—';

      const hallName = getAudiDisplayLabel(b);

      return `
        <tr>
          <td>${b.date}</td>
          <td style="font-weight:600;color:#fff">${b.movieName}</td>
          <td style="color:#d4a574;font-weight:600;">${hallName}</td>
          <td>${b.showtime}</td>
          <td style="font-family:monospace;color:#f97316">${b.seats.join(', ')}</td>
          <td style="color:#a3e635">${b.bookedByEmail}</td>
          <td>${snacks}</td>
          <td style="font-weight:700;color:#4ade80">₹${b.grandTotal}</td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Movie</th>
              <th>Hall</th>
              <th>Time</th>
              <th>Seats</th>
              <th>Booked By</th>
              <th>Snacks</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="admin-empty">Failed to load bookings: ${err.message}</div>`;
  }
}

function downloadBookingsXLSX() {
  const url = `${API_BASE}/api/admin/bookings/download?period=${adminBookingPeriod}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = `movieon_${adminBookingPeriod}_bookings.xlsx`;
  a.click();
  showToast('Downloading bookings report...', 'success');
}

// ── Admin Users Management View ───────────────────────────────
async function renderAdminUsers() {
  const content = document.getElementById('app-content');
  document.getElementById('sidebar').style.display = 'none';
  document.getElementById('step-nav-back').classList.add('step-nav--hidden');
  document.getElementById('step-nav-next').classList.add('step-nav--hidden');

  content.innerHTML = `
    <div class="admin-panel">
      <div class="admin-panel__title">👥 Manage Admins</div>
      <div class="admin-panel__sub">Add or remove portal administrators</div>

      <div class="admin-section">
        <div class="admin-section__header">
          <div class="admin-section__title">Admin Accounts</div>
        </div>

        <div id="admin-list-container">
          <div class="admin-empty">Loading admins...</div>
        </div>

        <div class="admin-add-form" style="margin-top:20px">
          <input
            type="email"
            class="admin-add-input"
            id="new-admin-email"
            placeholder="Enter email to add as admin"
            onkeydown="if(event.key==='Enter') addAdmin()"
          />
          <button class="admin-add-btn" onclick="addAdmin()">+ Add Admin</button>
        </div>
        <div id="admin-action-msg" style="margin-top:10px;font-size:13px;"></div>
      </div>
    </div>
  `;

  loadAdminList();
}

async function loadAdminList() {
  const container = document.getElementById('admin-list-container');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/api/admin/list`);
    const admins = await res.json();
    const defaultAdmin = 'ap2446961@gmail.com';

    if (!admins.length) {
      container.innerHTML = '<div class="admin-empty">No admins found.</div>';
      return;
    }

    container.innerHTML = admins.map(a => `
      <div class="admin-list-item">
        <div>
          <div class="admin-list-email">${a.email}</div>
          <div class="admin-list-badge">
            ${a.email === defaultAdmin ? '⭐ Default Admin' : `Added by ${a.addedBy}`}
          </div>
        </div>
        ${a.email !== defaultAdmin ? `
          <button class="admin-remove-btn" onclick="removeAdmin('${a.email}')">Remove</button>
        ` : '<span style="font-size:11px;color:#555">Cannot remove</span>'}
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="admin-empty">Error loading admins.</div>`;
  }
}

async function addAdmin() {
  const input = document.getElementById('new-admin-email');
  const msgEl = document.getElementById('admin-action-msg');
  const email = (input?.value || '').trim();

  if (!email || !email.includes('@')) {
    msgEl.style.color = '#f87171';
    msgEl.textContent = 'Please enter a valid email address.';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/admin/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newEmail: email, requestedByEmail: session.email })
    });

    const data = await res.json();

    if (!res.ok) {
      msgEl.style.color = '#f87171';
      msgEl.textContent = data.error || 'Failed to add admin.';
      return;
    }

    msgEl.style.color = '#4ade80';
    msgEl.textContent = `✅ ${email} added as admin.`;
    input.value = '';
    loadAdminList();
  } catch (err) {
    msgEl.style.color = '#f87171';
    msgEl.textContent = 'Server error. Try again.';
  }
}

async function removeAdmin(email) {
  if (!confirm(`Remove admin: ${email}?`)) return;

  const msgEl = document.getElementById('admin-action-msg');
  try {
    const res = await fetch(`${API_BASE}/api/admin/remove`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailToRemove: email, requestedByEmail: session.email })
    });

    const data = await res.json();
    if (!res.ok) {
      msgEl.style.color = '#f87171';
      msgEl.textContent = data.error || 'Failed to remove admin.';
      return;
    }

    msgEl.style.color = '#4ade80';
    msgEl.textContent = `✅ ${email} removed from admins.`;
    loadAdminList();
  } catch (err) {
    msgEl.style.color = '#f87171';
    msgEl.textContent = 'Server error.';
  }
}
