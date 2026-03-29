# 🎬 MOViEON — Premium Cinema Booking System

A sleek, dark-themed movie ticket booking web application for **PVR INOX — Uniworld City Downtown Mall, Kolkata**. Built with vanilla HTML, CSS & JavaScript — no frameworks, no build steps.

![MOViEON Home](https://img.shields.io/badge/Status-Live-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![Made with](https://img.shields.io/badge/Made%20with-Vanilla%20JS-yellow)

---

## ✨ Features

### 🎥 Movie Catalog
- **Real movie data** — currently showing films at PVR Downtown Mall, Kolkata
- **TMDB posters** — high-quality movie poster images from The Movie Database CDN
- **YouTube trailers** — watch official trailers in a cinematic fullscreen modal
- Genre tags, ratings, cast, director, synopsis for each film

### 💺 Smart Seat Selection
- **Interactive seat map** — Classic, Prime & Recliner zones with real-time availability
- **AI Auto-Select** — one-click smart seat recommendation engine that scores seats based on center proximity, row preference and zone type
- Visual seat legend with color-coded zones and pricing

### 🍿 Food & Beverages
- Full PVR-style F&B menu — Combos, Popcorn, Snacks, Beverages
- Add-to-cart with quantity controls
- Running order summary with live total calculation

### 💳 UPI Payment Integration
- **Dynamic UPI QR code** — generated with exact booking amount using `upi://pay` intent
- Works with any UPI app (Google Pay, PhonePe, Paytm, etc.)
- **15-second auto-proceed countdown** with animated progress bar
- Cancel button to abort payment

### 🎟️ Downloadable QR Ticket
- **Canvas-rendered PNG ticket** — downloads to your device as `MOViEON_Ticket_<ID>.png`
- Includes movie info, date, time, screen, seats, food order, total, QR code, venue address
- Premium dark design with gold border and gradient header
- Scannable QR code embedded directly in the ticket image

### 🧭 Navigation
- **Floating back/next arrows** — glassmorphic buttons on left/right edges for step-by-step navigation
- Context-aware visibility (hidden on home, hidden on confirmation)
- Validates required selections before proceeding

### 🗺️ Theatre Info Sidebar
- Embedded Google Maps with PVR Downtown Mall location
- Box office contact, tech capabilities (3D, Dolby, Recliner)
- One-click Google Maps directions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Structure** | HTML5, Semantic markup |
| **Styling** | Vanilla CSS, Custom properties, Glassmorphism |
| **Logic** | Vanilla JavaScript (ES6+) |
| **QR Codes** | [qrcode.js](https://github.com/davidshimjs/qrcodejs) via CDN |
| **Fonts** | Google Fonts — Inter, Outfit |
| **Movie Data** | [TMDB](https://www.themoviedb.org/) image CDN |

---

## 📂 Project Structure

```
Movieon/
├── index.html           # Entry point — app shell, header, sidebar
├── README.md
├── css/
│   └── styles.css       # Complete design system (~1800 lines)
└── js/
    ├── data.js          # Movies, screens, showtimes, F&B menu, booking store
    ├── utils.js         # Currency formatting, date helpers, toast notifications
    ├── seats.js         # Seat map renderer & AI recommendation engine
    ├── booking.js       # Order summary, ticket confirmation, QR generation, PNG download
    └── app.js           # Main controller — state, views, navigation, UPI payment
```

---

## 🚀 Getting Started

### Prerequisites
- A modern browser (Chrome, Edge, Firefox, Safari)
- Node.js (only for the local dev server)

### Run Locally

```bash
# Clone the repository
git clone https://github.com/ARIJIT-off/MovieOn.git
cd MovieOn

# Start a local server (any of these work)
npx serve -l 3000
# — or —
npx http-server -p 3000
# — or —
python -m http.server 3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 Booking Flow

```
Home → Movie Detail → Seat Selection → Food & Beverages → Checkout → UPI Payment → Confirmation
 ◀ ─────────────────── Back / Next ──────────────────── ▶
```

1. **Browse** — scroll through currently showing movies with real TMDB posters
2. **Select** — pick a date, showtime, and screen format (Standard / Recliner)
3. **Choose seats** — tap individual seats or use AI Auto-Select
4. **Add food** — optional combos, popcorn, snacks & drinks
5. **Checkout** — enter contact details, review order summary
6. **Pay** — scan the UPI QR code with any UPI app
7. **Get ticket** — download your QR ticket as a PNG file

---

## 📸 Screenshots

### Home Page
Real TMDB movie posters, ratings, and metadata for currently running films.

### Movie Detail
Synopsis, cast, director, genre tags, and a "Watch Trailer" button that opens the official YouTube trailer.

### Seat Selection
Interactive seat map with AI-powered auto-selection, zone pricing, and availability indicators.

### UPI Payment
Dynamic QR code with exact amount, 15-second countdown, and animated progress bar.

### Booking Confirmation
Downloadable QR ticket with all booking details rendered as a high-quality PNG.

---

## 🎬 Movies Currently Showing

| # | Movie | Language | Genre |
|---|-------|----------|-------|
| 1 | Dhurandhar: The Revenge | Hindi | Action, Thriller, Spy |
| 2 | Project Hail Mary | English | Sci-Fi, Adventure, Drama |
| 3 | The Bride! | English | Fantasy, Horror, Romance |
| 4 | Hoppers | English | Animation, Comedy, Family |
| 5 | Subedaar | Hindi | Action, Drama |
| 6 | Pushpa 2: The Rule | Hindi | Action, Drama |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Arijit Pal**

- GitHub: [@ARIJIT-off](https://github.com/ARIJIT-off)

---

> Built with ❤️ in Kolkata
