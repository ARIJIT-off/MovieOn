// ═══════════════════════════════════════════════════════════════
// MOViEON — Seat Map Renderer & AI Recommendation Engine
// ═══════════════════════════════════════════════════════════════

function renderSeatMap(audiId, bookedSeats, selectedSeats, recommendedSeats) {
  const screen = SCREENS.find(s => s.id === audiId);
  let html = '';

  // Screen indicator
  html += `<div class="seat-map__screen">
    <div class="seat-map__screen-curve"></div>
    <span>SCREEN</span>
  </div>`;

  // Seat grid
  html += '<div class="seat-map__grid">';

  screen.zones.forEach((zone, zi) => {
    // Zone separator
    html += `<div class="seat-map__zone-label" style="border-left: 3px solid ${zone.color}; color: ${zone.color}">
      <span class="zone-name">${zone.name}</span>
      <span class="zone-price">${formatCurrency(zone.price)}</span>
    </div>`;

    zone.rows.forEach(row => {
      html += `<div class="seat-row" data-row="${row}">`;
      html += `<span class="seat-row__label">${row}</span>`;
      html += `<div class="seat-row__seats">`;

      for (let s = 1; s <= zone.seatsPerRow; s++) {
        const seatId = `${row}${s}`;
        const isBooked = bookedSeats.has(seatId);
        const isSelected = selectedSeats.includes(seatId);
        const isRecommended = recommendedSeats.includes(seatId);

        let seatClass = 'seat';
        if (isBooked) seatClass += ' seat--booked';
        else if (isSelected) seatClass += ' seat--selected';
        else if (isRecommended) seatClass += ' seat--recommended';
        else seatClass += ' seat--available';

        if (zone.isRecliner) seatClass += ' seat--recliner';

        // Add gap in the middle for aisle
        const totalSeats = zone.seatsPerRow;
        const mid = Math.floor(totalSeats / 2);
        if (s === mid + 1) seatClass += ' seat--aisle-gap';

        html += `<button class="${seatClass}" data-seat="${seatId}" data-row="${row}" data-num="${s}" 
                  ${isBooked ? 'disabled' : ''} title="${seatId} — ${zone.name} ${formatCurrency(zone.price)}">
          <span class="seat__num">${s}</span>
          ${zone.isRecliner ? '<span class="seat__recliner-icon">♛</span>' : ''}
        </button>`;
      }

      html += `</div>`;
      html += `<span class="seat-row__label">${row}</span>`;
      html += `</div>`;
    });

    // Add spacing between zones
    if (zi < screen.zones.length - 1) {
      html += '<div class="seat-map__zone-gap"></div>';
    }
  });

  html += '</div>';

  // Legend
  html += `<div class="seat-map__legend">
    <div class="legend-item"><span class="legend-box legend-box--available"></span> Available</div>
    <div class="legend-item"><span class="legend-box legend-box--booked"></span> Booked</div>
    <div class="legend-item"><span class="legend-box legend-box--selected"></span> Selected</div>
    <div class="legend-item"><span class="legend-box legend-box--recommended"></span> AI Pick</div>
  </div>`;

  return html;
}


// ── AI Smart Seat Recommendation Engine ──────────────────────

function recommendSeats(audiId, count, preferredType, bookedSeats) {
  const screen = SCREENS.find(s => s.id === audiId);
  
  // Determine which zones to search
  let searchZones = screen.zones;
  if (preferredType) {
    const typeMap = {
      'classic': ['Classic'],
      'prime': ['Prime'],
      'primeplus': ['Prime Plus'],
      'recliner': ['Recliner', 'Recliner Plus']
    };
    const allowedNames = typeMap[preferredType] || [];
    const filtered = screen.zones.filter(z => allowedNames.includes(z.name));
    if (filtered.length > 0) searchZones = filtered;
  }

  // Collect all rows with availability info
  const candidates = [];

  searchZones.forEach(zone => {
    zone.rows.forEach(row => {
      const rowIdx = getRowIndex(screen, row);
      const totalRows = getTotalRows(screen);
      const middleRow = Math.floor(totalRows / 2);
      const rowScore = -Math.abs(rowIdx - middleRow); // Higher = closer to middle

      // Find contiguous available blocks in this row
      const blocks = findContiguousBlocks(row, zone.seatsPerRow, bookedSeats, count);
      
      blocks.forEach(block => {
        const centerCol = (zone.seatsPerRow + 1) / 2;
        const blockCenter = (block[0] + block[block.length - 1]) / 2;
        const colNum = parseInt(block[0].replace(/[A-Z]/g, ''));
        const colScore = -Math.abs(blockCenter - centerCol); // Higher = closer to center

        // Penalty for edge seats
        const firstSeatNum = parseInt(block[0].replace(/[A-Z]/g, ''));
        const lastSeatNum = parseInt(block[block.length - 1].replace(/[A-Z]/g, ''));
        let edgePenalty = 0;
        if (firstSeatNum <= 2) edgePenalty -= 3;
        if (lastSeatNum >= zone.seatsPerRow - 1) edgePenalty -= 3;

        // Penalty for front rows (A, B, C)
        let frontPenalty = 0;
        if (rowIdx < 3) frontPenalty -= 5;

        const totalScore = rowScore * 2 + colScore * 1.5 + edgePenalty + frontPenalty;

        candidates.push({
          seats: block.map(s => s),
          seatIds: block,
          row,
          zone: zone.name,
          price: zone.price,
          score: totalScore
        });
      });
    });
  });

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  if (candidates.length > 0) {
    return candidates[0].seatIds;
  }

  // Fallback: find any available seats
  return findAnyAvailableSeats(screen, bookedSeats, count);
}

function findContiguousBlocks(row, seatsPerRow, bookedSeats, count) {
  const blocks = [];
  
  for (let start = 1; start <= seatsPerRow - count + 1; start++) {
    let valid = true;
    const block = [];
    for (let s = start; s < start + count; s++) {
      const seatId = `${row}${s}`;
      if (bookedSeats.has(seatId)) {
        valid = false;
        break;
      }
      block.push(seatId);
    }
    if (valid) blocks.push(block);
  }

  // Sort blocks by center-ness
  const center = (seatsPerRow + 1) / 2;
  blocks.sort((a, b) => {
    const ac = a.reduce((sum, s) => sum + parseInt(s.replace(/[A-Z]/g, '')), 0) / a.length;
    const bc = b.reduce((sum, s) => sum + parseInt(s.replace(/[A-Z]/g, '')), 0) / b.length;
    return Math.abs(ac - center) - Math.abs(bc - center);
  });

  return blocks;
}

function getRowIndex(screen, targetRow) {
  let idx = 0;
  for (const zone of screen.zones) {
    for (const row of zone.rows) {
      if (row === targetRow) return idx;
      idx++;
    }
  }
  return idx;
}

function getTotalRows(screen) {
  let count = 0;
  screen.zones.forEach(z => count += z.rows.length);
  return count;
}

function findAnyAvailableSeats(screen, bookedSeats, count) {
  const available = [];
  screen.zones.forEach(zone => {
    zone.rows.forEach(row => {
      for (let s = 1; s <= zone.seatsPerRow; s++) {
        const seatId = `${row}${s}`;
        if (!bookedSeats.has(seatId)) available.push(seatId);
      }
    });
  });
  return available.slice(0, count);
}

// Helper to parse seat ID
function parseSeatId(seatId) {
  const row = seatId.replace(/[0-9]/g, '');
  const num = parseInt(seatId.replace(/[A-Z]/g, ''));
  return { row, num };
}
