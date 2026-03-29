// ═══════════════════════════════════════════════════════════════
// MOViEON — Booking, Payment & QR Ticket Engine
// ═══════════════════════════════════════════════════════════════

function createBooking(state) {
  const bookingId = generateBookingId();
  const seatTotal = calculateSeatTotal(state.selectedAudi, state.selectedSeats);
  const foodTotal = calculateFoodTotal(state.foodItems);
  const convenienceFee = 30;
  const grandTotal = seatTotal + foodTotal + convenienceFee;

  const booking = {
    id: bookingId,
    movie: MOVIES.find(m => m.id === state.selectedMovie),
    date: state.selectedDate,
    showtime: state.selectedShowtime,
    audi: SCREENS.find(s => s.id === state.selectedAudi),
    seats: [...state.selectedSeats],
    seatTotal,
    foodItems: { ...state.foodItems },
    foodTotal,
    convenienceFee,
    grandTotal,
    userName: state.userName,
    userMobile: state.userMobile,
    userEmail: state.userEmail,
    paymentMethod: state.paymentMethod,
    bookedAt: new Date().toISOString(),
    status: 'confirmed'
  };

  BOOKINGS.push(booking);
  markSeatsAsBooked(state.selectedMovie, state.selectedDate, state.selectedShowtime, state.selectedAudi, state.selectedSeats);

  return booking;
}

function lookupBooking(bookingId, mobile) {
  return BOOKINGS.find(b => 
    b.id.toUpperCase() === bookingId.toUpperCase() && 
    b.userMobile === mobile
  );
}

function cancelBooking(bookingId) {
  const booking = BOOKINGS.find(b => b.id === bookingId);
  if (booking) {
    booking.status = 'cancelled';
    return true;
  }
  return false;
}

function renderOrderSummary(state) {
  const movie = MOVIES.find(m => m.id === state.selectedMovie);
  const audi = SCREENS.find(s => s.id === state.selectedAudi);
  const seatTotal = calculateSeatTotal(state.selectedAudi, state.selectedSeats);
  const foodTotal = calculateFoodTotal(state.foodItems);
  const convenienceFee = 30;
  const grandTotal = seatTotal + foodTotal + convenienceFee;

  // Group seats by zone
  const seatsByZone = {};
  state.selectedSeats.forEach(seatId => {
    const row = seatId.replace(/[0-9]/g, '');
    const zone = getSeatZone(state.selectedAudi, row);
    if (!seatsByZone[zone.name]) seatsByZone[zone.name] = { seats: [], price: zone.price };
    seatsByZone[zone.name].seats.push(seatId);
  });

  let seatBreakdown = '';
  Object.entries(seatsByZone).forEach(([zoneName, info]) => {
    seatBreakdown += `
      <div class="summary-line">
        <span>${zoneName} × ${info.seats.length} (${info.seats.join(', ')})</span>
        <span>${formatCurrency(info.price * info.seats.length)}</span>
      </div>`;
  });

  let foodBreakdown = '';
  if (Object.keys(state.foodItems).length > 0) {
    Object.entries(state.foodItems).forEach(([id, qty]) => {
      if (qty > 0) {
        const item = getFoodItemById(id);
        foodBreakdown += `
          <div class="summary-line">
            <span>${item.emoji} ${item.name} × ${qty}</span>
            <span>${formatCurrency(item.price * qty)}</span>
          </div>`;
      }
    });
  }

  return `
    <div class="order-summary">
      <div class="order-summary__header">
        <h2>Order Summary</h2>
      </div>
      
      <div class="order-summary__section">
        <div class="order-summary__movie">
          <div class="summary-poster" style="background: ${movie.gradient}">
            <span>${movie.title.charAt(0)}</span>
          </div>
          <div>
            <h3>${movie.title}</h3>
            <p>${state.selectedDate} • ${state.selectedShowtime}</p>
            <p>${audi.name} — ${audi.type}</p>
          </div>
        </div>
      </div>

      <div class="order-summary__section">
        <h4>🎬 Seats</h4>
        ${seatBreakdown}
      </div>

      ${foodBreakdown ? `
      <div class="order-summary__section">
        <h4>🍿 Food & Beverages</h4>
        ${foodBreakdown}
      </div>` : ''}

      <div class="order-summary__divider"></div>

      <div class="order-summary__totals">
        <div class="summary-line">
          <span>Ticket Subtotal</span>
          <span>${formatCurrency(seatTotal)}</span>
        </div>
        ${foodTotal > 0 ? `
        <div class="summary-line">
          <span>Food & Beverages</span>
          <span>${formatCurrency(foodTotal)}</span>
        </div>` : ''}
        <div class="summary-line">
          <span>Convenience Fee</span>
          <span>${formatCurrency(convenienceFee)}</span>
        </div>
        <div class="summary-line summary-line--total">
          <span>Grand Total</span>
          <span>${formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </div>
  `;
}

function renderTicketConfirmation(booking) {
  const movie = booking.movie;
  const days = getNext7Days();
  const dateObj = days.find(d => d.date === booking.date);
  const dateDisplay = dateObj ? dateObj.full : booking.date;

  // Build food list
  let foodList = '';
  if (Object.keys(booking.foodItems).length > 0) {
    const items = [];
    Object.entries(booking.foodItems).forEach(([id, qty]) => {
      if (qty > 0) {
        const item = getFoodItemById(id);
        items.push(`${item.emoji} ${item.name} × ${qty}`);
      }
    });
    if (items.length > 0) {
      foodList = `<div class="ticket__food">
        <h4>🍿 Food Order</h4>
        <p>${items.join(' &nbsp;•&nbsp; ')}</p>
      </div>`;
    }
  }

  return `
    <div class="booking-confirmed" id="booking-confirmed">
      <div class="confetti-container" id="confetti-container"></div>
      
      <div class="booking-confirmed__badge">
        <div class="badge-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2>Booking Confirmed!</h2>
        <p class="booking-id-display">${booking.id}</p>
      </div>

      <div class="ticket" id="ticket-card">
        <div class="ticket__header" style="background: ${movie.gradient}">
          <div class="ticket__movie-info">
            <h3>${movie.title}</h3>
            <p>${movie.certificate} • ${movie.duration} • ${movie.language}</p>
          </div>
        </div>

        <div class="ticket__tear"></div>

        <div class="ticket__body">
          <div class="ticket__details-grid">
            <div class="ticket__detail">
              <span class="ticket__detail-label">📅 Date</span>
              <span class="ticket__detail-value">${dateDisplay}</span>
            </div>
            <div class="ticket__detail">
              <span class="ticket__detail-label">🕐 Time</span>
              <span class="ticket__detail-value">${booking.showtime}</span>
            </div>
            <div class="ticket__detail">
              <span class="ticket__detail-label">🖥️ Screen</span>
              <span class="ticket__detail-value">${booking.audi.name}</span>
            </div>
            <div class="ticket__detail">
              <span class="ticket__detail-label">💺 Seats</span>
              <span class="ticket__detail-value">${booking.seats.join(', ')}</span>
            </div>
          </div>

          ${foodList}

          <div class="ticket__qr" id="ticket-qr"></div>

          <div class="ticket__footer-info">
            <p><strong>${booking.userName}</strong> • ${booking.userMobile}</p>
            <p class="ticket__total">Total Paid: <strong>${formatCurrency(booking.grandTotal)}</strong></p>
          </div>
        </div>

        <div class="ticket__venue">
          <p>📍 ${THEATRE.shortName}</p>
          <p class="ticket__venue-address">${THEATRE.address}</p>
        </div>
      </div>

      <div class="booking-confirmed__actions">
        <button class="btn btn--primary" onclick="getDirections()">
          <span>📍</span> Get Directions
        </button>
        <button class="btn btn--secondary" onclick="downloadTicket()">
          <span>📥</span> Download Ticket
        </button>
        <button class="btn btn--ghost" onclick="navigate('home')">
          <span>🏠</span> Back to Home
        </button>
      </div>
    </div>
  `;
}

function generateQRCode(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  
  if (typeof QRCode !== 'undefined') {
    new QRCode(container, {
      text: JSON.stringify(data),
      width: 160,
      height: 160,
      colorDark: "#0a0a0f",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  } else {
    // Fallback: create a styled placeholder
    container.innerHTML = `<div class="qr-fallback">
      <div class="qr-pattern"></div>
      <p>QR Code</p>
    </div>`;
  }
}

function getDirections() {
  window.open(THEATRE.mapUrl, '_blank');
}

function downloadTicket() {
  const booking = BOOKINGS[BOOKINGS.length - 1];
  if (!booking) { showToast('No booking found', 'error'); return; }

  const days = getNext7Days();
  const dateObj = days.find(d => d.date === booking.date);
  const dateDisplay = dateObj ? dateObj.full : booking.date;

  const W = 500, padding = 32;
  // Pre-calculate heights
  let contentHeight = 0;
  contentHeight += 120; // header
  contentHeight += 16;  // gap after header
  contentHeight += 20;  // "BOOKING CONFIRMATION" label
  contentHeight += 8;
  contentHeight += 20;  // booking ID
  contentHeight += 28;  // gap
  contentHeight += 1;   // divider
  contentHeight += 20;  // gap
  contentHeight += 4 * 40; // 4 detail rows
  contentHeight += 16;  // gap

  // food items
  const foodItems = [];
  if (booking.foodItems && Object.keys(booking.foodItems).length > 0) {
    Object.entries(booking.foodItems).forEach(([id, qty]) => {
      if (qty > 0) {
        const item = getFoodItemById(id);
        if (item) foodItems.push({ name: item.name, qty, price: item.price * qty });
      }
    });
  }
  if (foodItems.length > 0) {
    contentHeight += 28; // food section header
    contentHeight += foodItems.length * 26; // food items
    contentHeight += 16; // gap
  }

  contentHeight += 1;   // divider
  contentHeight += 16;  // gap
  contentHeight += 30;  // TOTAL
  contentHeight += 24;  // gap
  contentHeight += 180; // QR code area
  contentHeight += 20;  // gap
  contentHeight += 18;  // name
  contentHeight += 18;  // mobile
  contentHeight += 24;  // gap
  contentHeight += 1;   // divider
  contentHeight += 16;  // gap
  contentHeight += 18;  // venue name
  contentHeight += 40;  // venue address
  contentHeight += 16;  // bottom padding

  const H = contentHeight + padding * 2;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, W, H);

  // Gold border
  ctx.strokeStyle = '#d4a574';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, W - 16, H - 16);

  let y = padding;

  // ── Movie Header (gradient band) ───────────────────────
  const gradientBg = ctx.createLinearGradient(0, y, W, y + 100);
  gradientBg.addColorStop(0, booking.movie.accent || '#d4a574');
  gradientBg.addColorStop(1, '#0a0a0f');
  ctx.fillStyle = gradientBg;
  ctx.fillRect(padding, y, W - padding * 2, 100);

  // MOViEON branding
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillText('MOViEON', padding + 12, y + 20);

  // Movie Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px Outfit, Inter, sans-serif';
  const title = booking.movie.title;
  ctx.fillText(title.length > 28 ? title.slice(0, 28) + '...' : title, padding + 12, y + 52);

  // Certificate • Duration • Language
  ctx.font = '12px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText(`${booking.movie.certificate} • ${booking.movie.duration} • ${booking.movie.language}`, padding + 12, y + 74);

  y += 120 + 16;

  // ── Booking Confirmation label ─────────────────────────
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillStyle = '#d4a574';
  ctx.textAlign = 'center';
  ctx.fillText('✦  BOOKING CONFIRMATION  ✦', W / 2, y);
  y += 8;

  ctx.font = '14px Inter, monospace';
  ctx.fillStyle = '#f0f0f0';
  ctx.fillText(booking.id, W / 2, y + 16);
  y += 20 + 28;
  ctx.textAlign = 'left';

  // ── Divider ────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(W - padding, y); ctx.stroke();
  ctx.setLineDash([]);
  y += 20;

  // ── Details Grid ───────────────────────────────────────
  const details = [
    { label: '📅 DATE', value: dateDisplay },
    { label: '🕐 TIME', value: booking.showtime },
    { label: '🖥️ SCREEN', value: booking.audi.name + ' — ' + booking.audi.type },
    { label: '💺 SEATS', value: booking.seats.join(', ') }
  ];

  details.forEach(d => {
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.fillStyle = '#808090';
    ctx.fillText(d.label, padding + 8, y + 12);

    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#f0f0f0';
    ctx.fillText(d.value.length > 40 ? d.value.slice(0, 40) + '...' : d.value, padding + 8, y + 30);
    y += 40;
  });
  y += 16;

  // ── Food Items ─────────────────────────────────────────
  if (foodItems.length > 0) {
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#d4a574';
    ctx.fillText('🍿 FOOD & BEVERAGES', padding + 8, y);
    y += 20;

    foodItems.forEach(fi => {
      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = '#a0a0b0';
      ctx.fillText(`${fi.name} × ${fi.qty}`, padding + 16, y + 6);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#f0f0f0';
      ctx.fillText(formatCurrency(fi.price), W - padding - 8, y + 6);
      ctx.textAlign = 'left';
      y += 26;
    });
    y += 16;
  }

  // ── Divider ────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(W - padding, y); ctx.stroke();
  ctx.setLineDash([]);
  y += 16;

  // ── Grand Total ────────────────────────────────────────
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.fillStyle = '#808090';
  ctx.fillText('TOTAL PAID', padding + 8, y + 8);

  ctx.textAlign = 'right';
  ctx.font = 'bold 22px Outfit, Inter, sans-serif';
  ctx.fillStyle = '#10b981';
  ctx.fillText(formatCurrency(booking.grandTotal), W - padding - 8, y + 10);
  ctx.textAlign = 'left';
  y += 30 + 24;

  // ── QR Code ────────────────────────────────────────────
  const qrContainer = document.getElementById('ticket-qr');
  const qrImg = qrContainer ? qrContainer.querySelector('img') || qrContainer.querySelector('canvas') : null;

  if (qrImg) {
    const qrSize = 150;
    const qrX = (W - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qrX - 8, y - 8, qrSize + 16, qrSize + 16);
    try {
      ctx.drawImage(qrImg, qrX, y, qrSize, qrSize);
    } catch(e) { /* silently handle CORS */ }
    y += qrSize + 16;

    ctx.font = '9px Inter, sans-serif';
    ctx.fillStyle = '#606070';
    ctx.textAlign = 'center';
    ctx.fillText('Scan at entry gate', W / 2, y);
    ctx.textAlign = 'left';
    y += 20;
  } else {
    y += 180;
  }

  // ── User Info ──────────────────────────────────────────
  ctx.font = 'bold 13px Inter, sans-serif';
  ctx.fillStyle = '#f0f0f0';
  ctx.textAlign = 'center';
  ctx.fillText(booking.userName, W / 2, y);
  y += 18;
  ctx.font = '12px Inter, sans-serif';
  ctx.fillStyle = '#a0a0b0';
  ctx.fillText(booking.userMobile, W / 2, y);
  ctx.textAlign = 'left';
  y += 24;

  // ── Venue Divider ──────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(W - padding, y); ctx.stroke();
  ctx.setLineDash([]);
  y += 16;

  // ── Venue ──────────────────────────────────────────────
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.fillStyle = '#d4a574';
  ctx.textAlign = 'center';
  ctx.fillText('📍 ' + THEATRE.shortName, W / 2, y);
  y += 18;
  ctx.font = '9px Inter, sans-serif';
  ctx.fillStyle = '#808090';
  // Word-wrap address
  const words = THEATRE.address.split(' ');
  let line = '';
  const maxW = W - padding * 2 - 20;
  words.forEach(word => {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), W / 2, y);
      y += 12;
      line = word + ' ';
    } else {
      line = test;
    }
  });
  if (line) ctx.fillText(line.trim(), W / 2, y);
  ctx.textAlign = 'left';

  // ── Download as PNG ────────────────────────────────────
  try {
    const link = document.createElement('a');
    link.download = `MOViEON_Ticket_${booking.id}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Ticket downloaded as PNG!', 'success');
  } catch(e) {
    showToast('Download failed — try screenshot instead', 'error');
  }
}

function triggerConfetti() {
  const container = document.getElementById('confetti-container');
  if (!container) return;

  const colors = ['#fbbf24', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#3b82f6', '#ec4899'];
  
  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.setProperty('--x', `${Math.random() * 100}%`);
    confetti.style.setProperty('--delay', `${Math.random() * 0.5}s`);
    confetti.style.setProperty('--rotation', `${Math.random() * 360}deg`);
    confetti.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
    confetti.style.setProperty('--size', `${5 + Math.random() * 8}px`);
    container.appendChild(confetti);
  }

  setTimeout(() => container.innerHTML = '', 4000);
}
