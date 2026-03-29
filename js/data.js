// ═══════════════════════════════════════════════════════════════
// MOViEON — Data Layer
// All theatre, movie, screenings, F&B, and booking data
// ═══════════════════════════════════════════════════════════════

const THEATRE = {
  name: "PVR INOX — Uniworld City Downtown Mall",
  shortName: "PVR Downtown Mall",
  address: "Ground Floor, Uniworld City Downtown Mall, Near Uniworld Residency, Biswa Bangla Saroni, New Town, Action Area III, Kolkata — 700156",
  contact: "8100610943",
  totalScreens: 3,
  tech: ["3D Capable", "Dolby Sound", "Recliner Seats", "Premium Brightness"],
  mapUrl: "https://www.google.com/maps/place/Downtown+Mall+-+New+Town/@22.5592151,88.4951619,21z/data=!4m6!3m5!1s0x3a0275ceff0c718b:0x2113e83bb99dfd87!8m2!3d22.5591143!4d88.4951667!16s%2Fg%2F1tm096ty?entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D",
  mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d920.6780820826658!2d88.49462017083618!3d22.559214099999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0275ceff0c718b%3A0x2113e83bb99dfd87!2sDowntown%20Mall%20-%20New%20Town!5e0!3m2!1sen!2sin!4v1711700000000",
  coords: { lat: 22.5591143, lng: 88.4951667 }
};

const SCREENS = [
  {
    id: 1,
    name: "Audi 1",
    type: "Standard",
    label: "STD",
    totalSeats: 180,
    zones: [
      { name: "Classic", rows: ["A","B","C","D","E","F"], seatsPerRow: 12, price: 160, color: "#4ade80", colorDim: "rgba(74,222,128,0.15)" },
      { name: "Prime", rows: ["G","H","I","J","K","L"], seatsPerRow: 12, price: 220, color: "#60a5fa", colorDim: "rgba(96,165,250,0.15)" },
      { name: "Prime Plus", rows: ["M","N"], seatsPerRow: 10, price: 260, color: "#c084fc", colorDim: "rgba(192,132,252,0.15)" }
    ]
  },
  {
    id: 2,
    name: "Audi 2",
    type: "Standard+",
    label: "STD+",
    totalSeats: 150,
    zones: [
      { name: "Classic", rows: ["A","B","C","D","E"], seatsPerRow: 12, price: 180, color: "#4ade80", colorDim: "rgba(74,222,128,0.15)" },
      { name: "Prime", rows: ["F","G","H","I","J","K"], seatsPerRow: 12, price: 240, color: "#60a5fa", colorDim: "rgba(96,165,250,0.15)" },
      { name: "Prime Plus", rows: ["L","M"], seatsPerRow: 9, price: 280, color: "#c084fc", colorDim: "rgba(192,132,252,0.15)" }
    ]
  },
  {
    id: 3,
    name: "Audi 3",
    type: "Recliner Premium",
    label: "REC",
    totalSeats: 70,
    zones: [
      { name: "Recliner", rows: ["A","B","C","D","E"], seatsPerRow: 8, price: 450, color: "#fbbf24", colorDim: "rgba(251,191,36,0.15)", isRecliner: true },
      { name: "Recliner Plus", rows: ["F","G"], seatsPerRow: 5, price: 500, color: "#f59e0b", colorDim: "rgba(245,158,11,0.15)", isRecliner: true }
    ]
  }
];

// ── Movies Currently Running at PVR Downtown Mall, Kolkata ───
const MOVIES = [
  {
    id: 1,
    title: "Dhurandhar: The Revenge",
    genre: ["Action", "Thriller", "Spy"],
    duration: "2h 45m",
    language: "Hindi",
    rating: 8.2,
    certificate: "UA",
    director: "Aditya Dhar",
    cast: ["Ranveer Singh", "Sanjay Dutt", "R. Madhavan", "Arjun Rampal"],
    synopsis: "RAW agent Jaskirat Singh Rangi returns for his most dangerous mission yet, infiltrating deep into enemy territory to dismantle a global terror network. A high-octane sequel packed with breathtaking action and geopolitical intrigue.",
    poster: "https://image.tmdb.org/t/p/w500/snBOuXDdhmTvlzMUvP9Em3Pp1u1.jpg",
    gradient: "linear-gradient(135deg, #b91c1c 0%, #7f1d1d 50%, #1c1917 100%)",
    accent: "#ef4444",
    trailerYouTubeId: "NHk7scrb_9I"
  },
  {
    id: 2,
    title: "Project Hail Mary",
    genre: ["Sci-Fi", "Adventure", "Drama"],
    duration: "2h 20m",
    language: "English",
    rating: 8.9,
    certificate: "UA",
    director: "Phil Lord & Christopher Miller",
    cast: ["Ryan Gosling", "Sandra Hüller", "Lionel Boyce"],
    synopsis: "A middle-school teacher wakes up on a spacecraft millions of miles from Earth with no memory of how he got there. As he pieces together his past, he discovers he's humanity's last hope against an extinction-level threat — and he's not alone on the ship.",
    poster: "https://image.tmdb.org/t/p/w500/yihdXomYb5kTeSivtFndMy5iDmf.jpg",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #0c1929 50%, #000000 100%)",
    accent: "#0ea5e9",
    trailerYouTubeId: "P0XN3-n-2Lo"
  },
  {
    id: 3,
    title: "The Bride!",
    genre: ["Fantasy", "Horror", "Romance"],
    duration: "2h 10m",
    language: "English",
    rating: 7.4,
    certificate: "A",
    director: "Maggie Gyllenhaal",
    cast: ["Jessie Buckley", "Christian Bale", "Penélope Cruz", "Annette Bening"],
    synopsis: "A gothic reimagining of the Bride of Frankenstein. She is created, she is rejected, she burns it all down. A darkly beautiful tale of autonomy, rage, and self-creation in 19th-century Europe.",
    poster: "https://image.tmdb.org/t/p/w500/lV8YHwGkYZsm6EfIqnhaSz2avKt.jpg",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 50%, #0f0a1e 100%)",
    accent: "#8b5cf6",
    trailerYouTubeId: "f4l3lJv5Dms"
  },
  {
    id: 4,
    title: "Hoppers",
    genre: ["Animation", "Comedy", "Family"],
    duration: "1h 45m",
    language: "English",
    rating: 7.6,
    certificate: "U",
    director: "Dan Scanlon",
    cast: ["Jon Hamm", "Bobby Moynihan", "Parvesh Cheena"],
    synopsis: "From the creators at Pixar comes a vibrant, quirky adventure about a group of misfit grasshoppers who must journey across a vast backyard to save their colony from an approaching storm. Heartwarming, hilarious, and visually stunning.",
    poster: "https://image.tmdb.org/t/p/w500/xjtWQ2CL1mpmMNwuU5HeS4Iuwuu.jpg",
    gradient: "linear-gradient(135deg, #065f46 0%, #064e3b 50%, #0a0f0d 100%)",
    accent: "#10b981",
    trailerYouTubeId: "PypDSyIRRSs"
  },
  {
    id: 5,
    title: "Subedaar",
    genre: ["Action", "Drama"],
    duration: "2h 15m",
    language: "Hindi",
    rating: 7.1,
    certificate: "UA",
    director: "Suresh Triveni",
    cast: ["Anil Kapoor", "Radhikka Madan", "Mona Singh", "Saurabh Shukla"],
    synopsis: "Retired Subedaar Arjun Maurya's quiet civilian life is shattered when his daughter is threatened by a ruthless crime syndicate. Forced to dust off his combat instincts, he wages a one-man war against the corrupt nexus controlling his hometown.",
    poster: "https://image.tmdb.org/t/p/w500/jXVkSIRHeFrMdkc8kStUE4LrJCb.jpg",
    gradient: "linear-gradient(135deg, #92400e 0%, #78350f 50%, #1c1917 100%)",
    accent: "#f59e0b",
    trailerYouTubeId: "wY1V7rEAQ3o"
  },
  {
    id: 6,
    title: "Pushpa 2: The Rule",
    genre: ["Action", "Drama"],
    duration: "2h 59m",
    language: "Hindi",
    rating: 7.8,
    certificate: "UA",
    director: "Sukumar",
    cast: ["Allu Arjun", "Rashmika Mandanna", "Fahadh Faasil"],
    synopsis: "Pushpa Raj continues his rise in the red sandalwood smuggling syndicate, facing off against ruthless antagonist SP Bhanwar Singh Shekhawat in an epic battle of power and survival.",
    poster: "https://image.tmdb.org/t/p/w500/t5ePZYRibJ0EEK1FK3GhihVkDW5.jpg",
    gradient: "linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #0c0a09 100%)",
    accent: "#dc2626",
    trailerYouTubeId: "1kVK0MZlbI4"
  }
];

const SHOWTIMES = ["10:00 AM", "1:15 PM", "4:30 PM", "7:45 PM", "10:30 PM"];

const FB_MENU = {
  combos: [
    { id: "c1", name: "Classic Combo", desc: "M Popcorn + Pepsi 500ml", price: 350, emoji: "🍿" },
    { id: "c2", name: "Jumbo Combo", desc: "L Popcorn + 2 Pepsi 750ml", price: 520, emoji: "🎉" },
    { id: "c3", name: "Nachos Combo", desc: "Nachos + Salsa + Pepsi", price: 380, emoji: "🌮" }
  ],
  popcorn: [
    { id: "p1", name: "Salted — Small", desc: "Classic salted popcorn", price: 180, emoji: "🧂" },
    { id: "p2", name: "Salted — Medium", desc: "Classic salted popcorn", price: 250, emoji: "🧂" },
    { id: "p3", name: "Salted — Large", desc: "Classic salted popcorn", price: 310, emoji: "🧂" },
    { id: "p4", name: "Caramel — Small", desc: "Sweet caramel popcorn", price: 180, emoji: "🍬" },
    { id: "p5", name: "Caramel — Medium", desc: "Sweet caramel popcorn", price: 250, emoji: "🍬" },
    { id: "p6", name: "Caramel — Large", desc: "Sweet caramel popcorn", price: 310, emoji: "🍬" }
  ],
  beverages: [
    { id: "b1", name: "Pepsi", desc: "500ml", price: 160, emoji: "🥤" },
    { id: "b2", name: "7UP", desc: "500ml", price: 160, emoji: "🥤" },
    { id: "b3", name: "Mountain Dew", desc: "500ml", price: 160, emoji: "🥤" },
    { id: "b4", name: "Aquafina Water", desc: "1L", price: 60, emoji: "💧" },
    { id: "b5", name: "Cold Coffee", desc: "Chilled brew", price: 180, emoji: "☕" }
  ],
  snacks: [
    { id: "s1", name: "Nachos with Salsa", desc: "Crispy nachos + dip", price: 220, emoji: "🌶️" },
    { id: "s2", name: "Hot Dog", desc: "Classic grilled", price: 240, emoji: "🌭" },
    { id: "s3", name: "Paneer Tikka Wrap", desc: "Spicy paneer roll", price: 280, emoji: "🌯" },
    { id: "s4", name: "Brownie with Ice Cream", desc: "Warm brownie + scoop", price: 200, emoji: "🍫" }
  ]
};

// ── In-Memory Store ──────────────────────────────────────────
const BOOKINGS = [];
const BOOKED_SEATS = {};

function getShowKey(movieId, date, showtime, audiId) {
  return `${movieId}-${date}-${showtime}-${audiId}`;
}

function getBookedSeats(movieId, date, showtime, audiId) {
  const key = getShowKey(movieId, date, showtime, audiId);
  if (!BOOKED_SEATS[key]) {
    BOOKED_SEATS[key] = generateRandomBookedSeats(audiId);
  }
  return BOOKED_SEATS[key];
}

function generateRandomBookedSeats(audiId) {
  const screen = SCREENS.find(s => s.id === audiId);
  const booked = new Set();
  const allSeats = [];
  screen.zones.forEach(zone => {
    zone.rows.forEach(row => {
      for (let s = 1; s <= zone.seatsPerRow; s++) {
        allSeats.push(`${row}${s}`);
      }
    });
  });
  const bookRate = 0.30 + Math.random() * 0.15;
  const bookCount = Math.floor(allSeats.length * bookRate);
  const shuffled = [...allSeats].sort(() => Math.random() - 0.5);
  shuffled.slice(0, bookCount).forEach(s => booked.add(s));
  return booked;
}

function markSeatsAsBooked(movieId, date, showtime, audiId, seatIds) {
  const key = getShowKey(movieId, date, showtime, audiId);
  if (!BOOKED_SEATS[key]) BOOKED_SEATS[key] = new Set();
  seatIds.forEach(s => BOOKED_SEATS[key].add(s));
}
