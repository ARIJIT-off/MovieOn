// ═══════════════════════════════════════════════════════════════
// MOViEON — Application Controller
// ═══════════════════════════════════════════════════════════════

// Global Application State
const state = {
  currentView: 'home',
  selectedMovie: null,
  selectedDate: null,
  selectedShowtime: null,
  selectedAudi: null,
  seatCount: 2,
  seatTypePreference: 'classic',
  selectedSeats: [],
  foodItems: {}, // { id: qty }
  userName: 'Guest User',
  userMobile: '+91 9876543210',
  userEmail: 'guest@movieon.com',
  paymentMethod: 'upi'
};

document.addEventListener('DOMContentLoaded', () => {
  initTheatreInfo();
  // Ensure background canvas gets set up
  initBackgroundCanvas();
  // Fallback to today
  state.selectedDate = getNext7Days()[0].date;
  
  navigate('home');
});

function initTheatreInfo() {
  document.getElementById('theatre-name').textContent = THEATRE.name;
  document.getElementById('theatre-address').textContent = THEATRE.address;
  document.getElementById('theatre-contact').textContent = THEATRE.contact;
  document.getElementById('theatre-map').src = THEATRE.mapEmbed;
  
  const techContainer = document.getElementById('theatre-tech');
  techContainer.innerHTML = THEATRE.tech.map(t => `<span class="tech-badge">${t}</span>`).join('');
}

function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Simple subtle stars background
  const stars = Array.from({length: 100}, () => ({
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
    // Static draw for performance since no loop requested
  }
  draw();
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
  });
}

// ── Step flow order ─────────────────────────────────────────
const VIEW_ORDER = ['home', 'movie-detail', 'seat-selection', 'food-selection', 'checkout', 'confirmation'];

function getViewIndex(view) { return VIEW_ORDER.indexOf(view); }

function updateStepNavVisibility() {
  const backBtn = document.getElementById('step-nav-back');
  const nextBtn = document.getElementById('step-nav-next');
  if (!backBtn || !nextBtn) return;

  const idx = getViewIndex(state.currentView);

  // Hide back on home
  if (idx <= 0) backBtn.classList.add('step-nav--hidden');
  else backBtn.classList.remove('step-nav--hidden');

  // Hide next on confirmation (and on home where no movie is selected yet)
  if (state.currentView === 'confirmation' || state.currentView === 'home') {
    nextBtn.classList.add('step-nav--hidden');
  } else {
    nextBtn.classList.remove('step-nav--hidden');
  }
}

window.stepBack = function() {
  const idx = getViewIndex(state.currentView);
  if (idx <= 0) return;
  const prev = VIEW_ORDER[idx - 1];
  // Skip confirmation going back (shouldn't happen, but safety)
  navigate(prev);
};

window.stepNext = function() {
  const idx = getViewIndex(state.currentView);
  const current = state.currentView;

  // Validate before proceeding forward
  if (current === 'movie-detail') {
    if (!state.selectedShowtime || !state.selectedAudi) {
      showToast('Please select date, showtime and screen first', 'error');
      return;
    }
    navigate('seat-selection');
  } else if (current === 'seat-selection') {
    if (state.selectedSeats.length === 0) {
      showToast('Please select at least one seat', 'error');
      return;
    }
    navigate('food-selection');
  } else if (current === 'food-selection') {
    navigate('checkout');
  } else if (current === 'checkout') {
    // Trigger the pay button
    processPayment();
  } else if (idx < VIEW_ORDER.length - 1) {
    navigate(VIEW_ORDER[idx + 1]);
  }
};

function navigate(viewName) {
  state.currentView = viewName;
  const container = document.getElementById('app-content');
  container.innerHTML = ''; // Clear container

  // Manage Nav Active State
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('nav-link--active'));
  if(viewName === 'home') document.querySelectorAll('.nav-link')[0].classList.add('nav-link--active');

  switch (viewName) {
    case 'home':
      // Reset state on home
      state.selectedMovie = null;
      state.selectedShowtime = null;
      state.selectedAudi = null;
      state.selectedSeats = [];
      state.foodItems = {};
      renderHome(container);
      break;
    case 'movie-detail':
      renderMovieDetail(container);
      break;
    case 'seat-selection':
      if(!state.selectedDate || !state.selectedShowtime || !state.selectedAudi) {
        showToast('Please select date, time and audi first', 'error');
        return navigate('movie-detail');
      }
      renderSeatSelection(container);
      break;
    case 'food-selection':
      if (state.selectedSeats.length === 0) {
          showToast('Please select seats first', 'error');
          return navigate('seat-selection');
      }
      renderFoodSelection(container);
      break;
    case 'checkout':
      renderCheckout(container);
      break;
    case 'confirmation':
      const currentBooking = BOOKINGS[BOOKINGS.length - 1]; // Just created
      container.innerHTML = renderTicketConfirmation(currentBooking);
      generateQRCode('ticket-qr', { id: currentBooking.id, type: 'MTICKET' });
      triggerConfetti();
      break;
  }
  animateIn(container);
  updateStepNavVisibility();
}

// ── Views ───────────────────────────────────────────────────────

function renderHome(container) {
  let html = `
    <div class="section-header">
      <div class="section-header__label">Now Showing</div>
      <h1 class="section-header__title">Recommended For You</h1>
    </div>
    <div class="movie-grid">
  `;
  
  MOVIES.forEach(m => {
    html += `
      <div class="movie-card" onclick="selectMovie(${m.id})">
        <div class="movie-card__poster">
          <img class="movie-card__poster-img" src="${m.poster}" alt="${m.title}" onerror="this.src=''; this.style.background='${m.gradient}'">
          <div class="movie-card__poster-gradient"></div>
          <div class="movie-card__rating">⭐ ${m.rating}</div>
        </div>
        <div class="movie-card__info">
          <h2 class="movie-card__title">${m.title}</h2>
          <div class="movie-card__meta">
            <span class="movie-card__genre">${m.certificate}</span>
            <span class="movie-card__duration">${m.duration}</span>
            <span class="movie-card__genre">${m.language}</span>
          </div>
        </div>
      </div>
    `;
  });
  
  html += `</div>`;
  container.innerHTML = html;
}

function selectMovie(id) {
  state.selectedMovie = id;
  navigate('movie-detail');
}

function renderMovieDetail(container) {
  const movie = MOVIES.find(m => m.id === state.selectedMovie);
  
  let html = `
    <div class="movie-detail">
      <div class="movie-detail__hero">
        <div class="movie-detail__poster" style="background: ${movie.gradient}">
           <img class="movie-detail__poster-img" src="${movie.poster}" alt="${movie.title}" onerror="this.style.display='none'" crossorigin="anonymous">
        </div>
        <div class="movie-detail__info">
          <h1 class="movie-detail__title">${movie.title}</h1>
          <div class="movie-detail__badges">
             <span class="detail-badge detail-badge--rating">⭐ ${movie.rating}/10</span>
             ${movie.genre.map(g => `<span class="detail-badge">${g}</span>`).join('')}
             <span class="detail-badge">${movie.duration}</span>
             <span class="detail-badge">${movie.certificate}</span>
             <span class="detail-badge">${movie.language}</span>
          </div>
          <p class="movie-detail__synopsis">${movie.synopsis}</p>
          <p class="movie-detail__cast"><strong>Cast:</strong> ${movie.cast.join(', ')}</p>
          <p class="movie-detail__cast" style="margin-top:4px;"><strong>Director:</strong> ${movie.director}</p>
          
          ${movie.trailerYouTubeId ? `
          <div style="margin-top:20px;">
            <button id="btn-watch-trailer" style="display:inline-flex; align-items:center; gap:8px; padding:12px 24px; border-radius:var(--radius-sm); border:1px solid #ef4444; background:rgba(239,68,68,0.1); color:#ef4444; font-weight:700; font-size:14px; cursor:pointer; transition:var(--transition);" onclick="openTrailer('${movie.trailerYouTubeId}')">
              ▶ Watch Trailer
            </button>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="section-header">
        <h2 class="section-header__title" style="font-size:22px;">Select Show</h2>
      </div>

      <div class="date-picker">
        ${getNext7Days().map(d => `
          <button class="date-btn ${state.selectedDate === d.date ? 'date-btn--active' : ''}" onclick="selectDate('${d.date}')">
            <div class="date-btn__day">${d.label}</div>
            <div class="date-btn__num">${d.dayNum}</div>
            <div class="date-btn__month">${d.month}</div>
          </button>
        `).join('')}
      </div>

      <div class="showtime-section">
        <div class="showtime-grid">
          ${SHOWTIMES.map(t => `
            <button class="showtime-btn ${state.selectedShowtime === t ? 'showtime-btn--active' : ''}" onclick="selectShowtime('${t}')">${t}</button>
          `).join('')}
        </div>
      </div>
      
      ${state.selectedShowtime ? renderAudiSelector() : ''}
    </div>

    <!-- Trailer Modal -->
    <div id="trailer-modal" style="display:none; position:fixed; inset:0; z-index:1000; background:rgba(0,0,0,0.92); backdrop-filter:blur(12px); justify-content:center; align-items:center;">
      <div style="position:relative; width:90%; max-width:900px; aspect-ratio:16/9;">
        <button onclick="closeTrailer()" style="position:absolute; top:-40px; right:0; background:transparent; border:none; color:#fff; font-size:28px; cursor:pointer; z-index:1001;">✕</button>
        <iframe id="trailer-iframe" src="" style="width:100%; height:100%; border:none; border-radius:var(--radius-md);" allow="autoplay; encrypted-media" allowfullscreen></iframe>
      </div>
    </div>
  `;
  container.innerHTML = html;
}

window.openTrailer = function(youtubeId) {
  const modal = document.getElementById('trailer-modal');
  const iframe = document.getElementById('trailer-iframe');
  if(modal && iframe) {
    iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;
    modal.style.display = 'flex';
  }
};

window.closeTrailer = function() {
  const modal = document.getElementById('trailer-modal');
  const iframe = document.getElementById('trailer-iframe');
  if(modal && iframe) {
    iframe.src = '';
    modal.style.display = 'none';
  }
};

function renderAudiSelector() {
  return `
    <div style="margin-top:32px;">
      <h3 style="font-size:16px; margin-bottom: 16px;">Select Screen Format</h3>
      <div class="audi-grid">
        ${SCREENS.map(s => {
          const prices = s.zones.map(z => z.price);
          const minP = Math.min(...prices);
          const maxP = Math.max(...prices);
          return `
            <div class="audi-card ${state.selectedAudi === s.id ? 'audi-card--active' : ''}" onclick="selectAudi(${s.id})">
              <div class="audi-card__name">${s.name} ${s.label}</div>
              <div class="audi-card__type">${s.type}</div>
              <div class="audi-card__seats">${s.totalSeats} seats</div>
              <div class="audi-card__price-range">₹${minP} - ₹${maxP}</div>
            </div>
          `;
        }).join('')}
      </div>
      
      ${state.selectedAudi ? `
        <div style="display:flex; justify-content: flex-end; margin-top:24px;">
           <button class="btn btn--primary" style="padding: 14px 32px; font-size: 16px; border-radius: var(--radius-sm); border:none; background: var(--accent-gold); color:#0a0a0f; font-weight:700; cursor:pointer;" onclick="navigate('seat-selection')">
             Proceed to Seat Layout
           </button>
        </div>
      ` : ''}
    </div>
  `;
}

// Handlers for Movie Detail
window.selectDate = function(date) { state.selectedDate = date; navigate('movie-detail'); };
window.selectShowtime = function(time) { state.selectedShowtime = time; state.selectedAudi = null; navigate('movie-detail'); };
window.selectAudi = function(audi) { state.selectedAudi = audi; navigate('movie-detail'); };

function renderSeatSelection(container) {
  const bookedSeats = getBookedSeats(state.selectedMovie, state.selectedDate, state.selectedShowtime, state.selectedAudi);
  const recommendedSeats = recommendSeats(state.selectedAudi, state.seatCount, state.seatTypePreference, bookedSeats);

  const seatMapHtml = renderSeatMap(state.selectedAudi, bookedSeats, state.selectedSeats, recommendedSeats);

  let html = `
    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:20px;">
      <div>
        <h2 style="font-family: var(--font-display); font-size:24px;">Select Seats</h2>
        <p style="color:var(--text-secondary); font-size:14px; margin-top:4px;">How many tickets do you need?</p>
      </div>
      <div>
        ${state.selectedSeats.length > 0 ? `
          <button class="btn btn--primary" style="padding: 12px 24px; font-size: 14px; border-radius: var(--radius-sm); border:none; background: var(--accent-gold); color:#0a0a0f; font-weight:700; cursor:pointer;" onclick="navigate('food-selection')">
             Confirm Seats (${state.selectedSeats.length})
          </button>
        `: `
          <button disabled style="padding: 12px 24px; font-size: 14px; border-radius: var(--radius-sm); border:none; background: #333; color:#777; font-weight:700; cursor:not-allowed;">
             Select Seats First
          </button>
        `}
      </div>
    </div>

    <div class="seat-input-form">
      <div class="form-group">
        <label>Number of Seats</label>
        <select id="seat-count" onchange="updateSeatPreference()">
          ${[1,2,3,4,5,6,7,8,9,10].map(n => `<option value="${n}" ${state.seatCount == n ? 'selected' : ''}>${n}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Preferred Seating</label>
        <select id="seat-type" onchange="updateSeatPreference()">
          <option value="classic" ${state.seatTypePreference == 'classic' ? 'selected':''}>Classic</option>
          <option value="prime" ${state.seatTypePreference == 'prime' ? 'selected':''}>Prime / Standard</option>
          <option value="recliner" ${state.seatTypePreference == 'recliner' ? 'selected':''}>Recliner / VIP</option>
        </select>
      </div>
      <div class="form-group" style="flex:0; padding-bottom: 4px;">
        <button style="padding: 10px 16px; background: rgba(139,92,246,0.15); border: 1px solid var(--accent-violet); color: var(--accent-violet); border-radius: 6px; cursor: pointer; white-space:nowrap; font-weight: 600;" onclick="autoSelectSeats()">
          ✨ AI Auto-Select
        </button>
      </div>
    </div>
    
    <div class="seat-map-container" id="seat-map-render-area">
      ${seatMapHtml}
    </div>
  `;
  container.innerHTML = html;

  attachSeatClickListeners();
}

window.updateSeatPreference = function() {
  state.seatCount = parseInt(document.getElementById('seat-count').value, 10);
  state.seatTypePreference = document.getElementById('seat-type').value;
  // Re-render to show updated AI recommendation
  navigate('seat-selection');
};

window.autoSelectSeats = function() {
  const bookedSeats = getBookedSeats(state.selectedMovie, state.selectedDate, state.selectedShowtime, state.selectedAudi);
  const recommended = recommendSeats(state.selectedAudi, state.seatCount, state.seatTypePreference, bookedSeats);
  if(recommended.length > 0) {
    state.selectedSeats = [...recommended];
    navigate('seat-selection');
  } else {
    showToast('No contiguous seats available for your preference', 'error');
  }
};

function attachSeatClickListeners() {
  document.querySelectorAll('.seat').forEach(seatElem => {
    seatElem.addEventListener('click', function() {
      if(this.disabled) return;
      const seatId = this.getAttribute('data-seat');
      
      if(state.selectedSeats.includes(seatId)){
        state.selectedSeats = state.selectedSeats.filter(id => id !== seatId);
      } else {
        if(state.selectedSeats.length >= state.seatCount) {
           // Queueing logic: remove first, add new
           state.selectedSeats.shift();
        }
        state.selectedSeats.push(seatId);
      }
      navigate('seat-selection'); // Re-render efficiently in real app, but this works
    });
  });
}

function renderFoodSelection(container) {
  let html = `
    <div style="display:flex; gap: 32px;">
      <div style="flex: 2;">
         <div style="margin-bottom: 24px; display:flex; justify-content:space-between; align-items:center;">
           <h2 style="font-family: var(--font-display); font-size:24px;">Grab a Bite</h2>
           <button class="btn" style="padding: 8px 16px; font-size: 13px; border-radius: var(--radius-sm); border:1px solid var(--border-subtle); background: transparent; color:var(--text-secondary); cursor:pointer;" onclick="navigate('checkout')">
             Skip F&B
           </button>
         </div>
         
         ${renderFoodCategory('Snacks & Quick Bites', FB_MENU.snacks)}
         ${renderFoodCategory('Combos (Save up to 15%)', FB_MENU.combos)}
         ${renderFoodCategory('Popcorn', FB_MENU.popcorn)}
         ${renderFoodCategory('Beverages', FB_MENU.beverages)}
      </div>
      
      <div style="flex: 1; min-width:320px;">
        <div style="position:sticky; top:24px;">
           ${renderOrderSummary(state)}
           <div style="margin-top:20px;">
             <button style="width:100%; padding: 16px; border-radius: var(--radius-md); border:none; background: var(--accent-gold); color:#0a0a0f; font-weight:800; font-size:16px; cursor:pointer;" onclick="navigate('checkout')">
                Proceed to Pay
             </button>
           </div>
        </div>
      </div>
    </div>
  `;
  container.innerHTML = html;
}

function renderFoodCategory(title, items) {
  return `
    <div style="margin-bottom: 32px;">
      <h3 style="font-size:16px; margin-bottom:16px; color:var(--accent-gold); font-weight:600;">${title}</h3>
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap:16px;">
        ${items.map(item => `
          <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius: var(--radius-md); padding:16px; dilsplay:flex; flex-direction:column;">
            <div style="font-size:32px; margin-bottom:12px;">${item.emoji}</div>
            <h4 style="font-size:15px; margin-bottom:4px;">${item.name}</h4>
            <p style="font-size:12px; color:var(--text-secondary); margin-bottom:16px; flex:1;">${item.desc}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
              <span style="font-weight:700; color:var(--text-primary);">${formatCurrency(item.price)}</span>
              ${(state.foodItems[item.id] || 0) > 0 ? `
                 <div style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.05); padding:4px; border-radius:4px; border:1px solid rgba(255,255,255,0.1);">
                   <button style="border:none; background:transparent; color:#fff; cursor:pointer; width:24px; height:24px;" onclick="updateFood('${item.id}', -1)">-</button>
                   <span style="font-size:13px; font-weight:600; width:16px; text-align:center;">${state.foodItems[item.id]}</span>
                   <button style="border:none; background:transparent; color:#fff; cursor:pointer; width:24px; height:24px;" onclick="updateFood('${item.id}', 1)">+</button>
                 </div>
              ` : `
                 <button style="padding:6px 16px; border-radius:4px; border:1px solid var(--accent-emerald); background:rgba(16,185,129,0.1); color:var(--accent-emerald); font-size:12px; font-weight:600; cursor:pointer;" onclick="updateFood('${item.id}', 1)">Add</button>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

window.updateFood = function(id, delta) {
  const current = state.foodItems[id] || 0;
  const next = current + delta;
  if(next <= 0) delete state.foodItems[id];
  else state.foodItems[id] = next;
  navigate('food-selection');
};

function renderCheckout(container) {
  const total = calculateSeatTotal(state.selectedAudi, state.selectedSeats) + calculateFoodTotal(state.foodItems) + 30;

  let html = `
    <div style="display:flex; gap: 32px;">
      <div style="flex: 2;">
         <h2 style="font-family: var(--font-display); font-size:24px; margin-bottom:24px;">Checkout</h2>
         
         <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius: var(--radius-md); padding:24px; margin-bottom:24px;">
           <h3 style="font-size:16px; margin-bottom:16px; border-bottom:1px solid var(--border-subtle); padding-bottom:12px;">Contact Details</h3>
           <div style="display:flex; gap:16px; margin-bottom:16px;">
             <div class="form-group">
               <label>Full Name</label>
               <input type="text" value="${state.userName}" id="chk-name" />
             </div>
             <div class="form-group">
               <label>Mobile Number</label>
               <input type="text" value="${state.userMobile}" id="chk-mobile" />
             </div>
           </div>
           <div class="form-group" style="margin-bottom:0;">
             <label>Email ID</label>
             <input type="email" value="${state.userEmail}" id="chk-email" />
           </div>
         </div>

         <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius: var(--radius-md); padding:24px;">
           <h3 style="font-size:16px; margin-bottom:16px; border-bottom:1px solid var(--border-subtle); padding-bottom:12px;">Payment Method</h3>
           <div style="display:flex; flex-direction:column; gap:12px;">
             <label style="display:flex; align-items:center; gap:12px; padding:16px; border:1px solid var(--accent-gold); background:rgba(212,165,116,0.05); border-radius:8px; cursor:pointer;">
               <input type="radio" name="paymethod" value="razorpay" checked />
               <span style="font-weight:600;">💳 Razorpay — UPI, Card, Netbanking, Wallet</span>
             </label>
           </div>
           <p style="font-size:11px; color:var(--text-muted); margin-top:12px;">Powered by Razorpay. All payment methods supported securely.</p>
         </div>
      </div>
      
      <div style="flex: 1; min-width:320px;">
        <div style="position:sticky; top:24px;">
           ${renderOrderSummary(state)}
           <div style="margin-top:20px;">
             <button id="btn-pay-now" style="width:100%; padding: 16px; border-radius: var(--radius-md); border:none; background: var(--accent-emerald); color:#fff; font-weight:800; font-size:16px; cursor:pointer; box-shadow: 0 4px 16px rgba(16,185,129,0.3);" onclick="processPayment()">
                Pay ${formatCurrency(total)}
             </button>
           </div>
           <p style="text-align:center; font-size:11px; color:var(--text-muted); margin-top:12px;">🔒 Payments are 256-bit SSL encrypted</p>
        </div>
      </div>
    </div>
  `;
  container.innerHTML = html;
}

// ── Razorpay Payment Server ──────────────────────────────────
const PAYMENT_SERVER = 'http://localhost:4000';
const RAZORPAY_KEY_ID = 'rzp_test_SX8U1HsCZTRftK';

window.processPayment = async function() {
  state.userName = document.getElementById('chk-name').value;
  state.userMobile = document.getElementById('chk-mobile').value;
  state.userEmail = document.getElementById('chk-email').value;

  const total = calculateSeatTotal(state.selectedAudi, state.selectedSeats) + calculateFoodTotal(state.foodItems) + 30;
  const amountPaise = Math.round(total * 100);

  // Disable button while loading
  const payBtn = document.getElementById('btn-pay-now');
  payBtn.disabled = true;
  payBtn.textContent = 'Creating order…';
  payBtn.style.opacity = '0.6';

  try {
    // 1️⃣ Create order on backend
    const movie = MOVIES.find(m => m.id === state.selectedMovie);
    const orderResp = await fetch(`${PAYMENT_SERVER}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountPaise,
        receipt: `MOV_${Date.now()}`,
        notes: {
          movie: movie ? movie.title : 'Unknown',
          seats: state.selectedSeats.join(', '),
          customer: state.userName
        }
      })
    });

    if (!orderResp.ok) {
      const errData = await orderResp.json().catch(() => ({}));
      throw new Error(errData.error || 'Order creation failed');
    }

    const { orderId } = await orderResp.json();

    // 2️⃣ Open Razorpay Checkout
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: amountPaise,
      currency: 'INR',
      name: 'MOViEON',
      description: movie ? `${movie.title} — ${state.selectedSeats.join(', ')}` : 'Movie Ticket',
      order_id: orderId,
      prefill: {
        name: state.userName,
        email: state.userEmail,
        contact: state.userMobile.replace(/[^\d+]/g, '')
      },
      theme: {
        color: '#d4a574'
      },
      handler: async function(response) {
        // 3️⃣ Verify signature on server
        try {
          const verifyResp = await fetch(`${PAYMENT_SERVER}/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyResp.json();

          if (verifyData.verified) {
            // ✅ Payment verified — create booking
            createBooking(state);
            showToast(`Payment verified! ID: ${response.razorpay_payment_id}`, 'success');
            setTimeout(() => navigate('confirmation'), 800);
          } else {
            showToast('Payment verification failed — contact support', 'error');
            resetPayButton();
          }
        } catch (verifyErr) {
          // Verification call failed but payment may have succeeded
          console.error('Verify error:', verifyErr);
          createBooking(state);
          showToast('Payment received! Generating ticket...', 'success');
          setTimeout(() => navigate('confirmation'), 800);
        }
      },
      modal: {
        ondismiss: function() {
          showToast('Payment cancelled', 'error');
          resetPayButton();
        }
      }
    };

    const rzp = new Razorpay(options);

    rzp.on('payment.failed', function(response) {
      showToast(`Payment failed: ${response.error.description}`, 'error');
      resetPayButton();
    });

    rzp.open();

  } catch (err) {
    console.error('Payment error:', err);
    showToast(err.message || 'Payment failed — is the server running?', 'error');
    resetPayButton();
  }
};

function resetPayButton() {
  const payBtn = document.getElementById('btn-pay-now');
  if (payBtn) {
    const total = calculateSeatTotal(state.selectedAudi, state.selectedSeats) + calculateFoodTotal(state.foodItems) + 30;
    payBtn.disabled = false;
    payBtn.textContent = `Pay ${formatCurrency(total)}`;
    payBtn.style.opacity = '1';
  }
}
