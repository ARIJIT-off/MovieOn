// ═══════════════════════════════════════════════════════════════
// MOViEON — Utility Functions
// ═══════════════════════════════════════════════════════════════

let bookingCounter = 412;

function generateBookingId() {
  bookingCounter++;
  return `MOV-2025-KOL-${String(bookingCounter).padStart(5, '0')}`;
}

function formatCurrency(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function getNext7Days() {
  const days = [];
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      date: d.toISOString().split('T')[0],
      day: dayNames[d.getDay()],
      dayNum: d.getDate(),
      month: monthNames[d.getMonth()],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[d.getDay()],
      full: `${d.getDate()} ${monthNames[d.getMonth()]}`,
    });
  }
  return days;
}

function getSeatZone(audiId, row) {
  const screen = SCREENS.find(s => s.id === audiId);
  for (const zone of screen.zones) {
    if (zone.rows.includes(row)) return zone;
  }
  return null;
}

function calculateSeatTotal(audiId, seatIds) {
  let total = 0;
  seatIds.forEach(seatId => {
    const row = seatId.replace(/[0-9]/g, '');
    const zone = getSeatZone(audiId, row);
    if (zone) total += zone.price;
  });
  return total;
}

function calculateFoodTotal(foodItems) {
  let total = 0;
  const allItems = [...FB_MENU.combos, ...FB_MENU.popcorn, ...FB_MENU.beverages, ...FB_MENU.snacks];
  Object.entries(foodItems).forEach(([id, qty]) => {
    const item = allItems.find(i => i.id === id);
    if (item) total += item.price * qty;
  });
  return total;
}

function getFoodItemById(id) {
  const allItems = [...FB_MENU.combos, ...FB_MENU.popcorn, ...FB_MENU.beverages, ...FB_MENU.snacks];
  return allItems.find(i => i.id === id);
}

function animateIn(element, delay = 0) {
  element.style.opacity = '0';
  element.style.transform = 'translateY(20px)';
  setTimeout(() => {
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  }, delay);
}

function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast__icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
    <span class="toast__message">${message}</span>
  `;
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => toast.classList.add('toast--visible'));
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
