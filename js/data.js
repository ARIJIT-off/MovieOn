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

// ── Movies Currently Running at PVR INOX, India — November 2026 ──
const MOVIES = [
  {
    id: 1,
    title: "Ramayana: Rise of a Legend",
    genre: ["Epic", "Mythology", "Adventure"],
    duration: "2h 50m",
    language: "Hindi",
    rating: 9.1,
    certificate: "UA",
    director: "Nitesh Tiwari",
    cast: ["Ranbir Kapoor", "Sai Pallavi", "Yash", "Sunny Deol"],
    synopsis: "The timeless epic of Lord Rama comes to life in an unprecedented visual spectacle. When Prince Rama is exiled from Ayodhya for fourteen years, he embarks on a journey that will define the eternal struggle between good and evil. Featuring breathtaking visual effects by DNEG and an iconic score by Hans Zimmer and A.R. Rahman.",
    poster: "https://image.tmdb.org/t/p/w500/cK6xaYrb498y2rmMRSZmRKaCXKL.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bkhPaFOiqc9GeLMdf1D44KbozRH.jpg",
    gradient: "linear-gradient(135deg, #7c2d12 0%, #451a03 50%, #1c0a00 100%)",
    accent: "#f97316",
    trailerYouTubeId: "lNaSdnz2I8g"
  },
  {
    id: 2,
    title: "Clayface",
    genre: ["Thriller", "Horror", "Superhero"],
    duration: "2h 08m",
    language: "English",
    rating: 7.8,
    certificate: "A",
    director: "James Watkins",
    cast: ["Tom Rhys Harries", "Naomi Scott", "Rakhee Thakrar", "Jack Lowden"],
    synopsis: "Matt Hagen, a disfigured actor, is transformed by an experimental compound into the shapeshifting monster known as Clayface. As he loses his grip on identity and sanity, he becomes a terrifying force of vengeance against those who wronged him. DC Studios' darkest and most visceral film to date.",
    poster: "https://image.tmdb.org/t/p/w500/mP4XfTSMBcJgUS9wJLL9xOg1Knv.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/xSDoxv4pHvs4xZjvTb0Iqg1A6ro.jpg",
    gradient: "linear-gradient(135deg, #1e1b4b 0%, #0f0a1e 50%, #000000 100%)",
    accent: "#818cf8",
    trailerYouTubeId: "EwuYcTf0QBM"
  },
  {
    id: 3,
    title: "Drishyam: The Conclusion",
    genre: ["Thriller", "Crime", "Drama"],
    duration: "2h 30m",
    language: "Hindi",
    rating: 7.6,
    certificate: "UA",
    director: "Abhishek Pathak",
    cast: ["Ajay Devgn", "Tabu", "Jaideep Ahlawat", "Shriya Saran", "Prakash Raj"],
    synopsis: "Vijay Salgaonkar's carefully constructed web of deception faces its ultimate test as a dogged Crime Branch officer armed with new forensic evidence closes in on the truth. The gripping conclusion to India's most beloved thriller franchise — where every lie has a price.",
    poster: "https://image.tmdb.org/t/p/w500/67FsF2kpgEZ1T5Qos4adgqm9dLf.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/nq73eRdEooripf3k0XHLtX14zyC.jpg",
    gradient: "linear-gradient(135deg, #164e63 0%, #083344 50%, #030712 100%)",
    accent: "#22d3ee",
    trailerYouTubeId: "0Cj_gGMGPqM"
  },
  {
    id: 4,
    title: "Prahaar: The Untold Story",
    genre: ["Biographical", "Legal", "Drama"],
    duration: "2h 20m",
    language: "Hindi",
    rating: 8.5,
    certificate: "UA",
    director: "Avinash Arun",
    cast: ["Rajkummar Rao", "Wamiqa Gabbi", "Jaideep Ahlawat", "Ashish Vidyarthi"],
    synopsis: "The extraordinary true story of Ujjwal Nikam — India's most formidable public prosecutor — who built iron-clad cases against perpetrators of the 1993 Bombay blasts and the 2008 Mumbai terror attacks. Armed with only evidence and truth, he fought battles that defined modern India's justice system.",
    poster: "https://image.tmdb.org/t/p/w500/wTrBTNfHHmpPwiB9rpn0tGbSW1m.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/8S2DXdKY23wfYq4v0awYXov4c8g.jpg",
    gradient: "linear-gradient(135deg, #78350f 0%, #451a03 50%, #1c0a00 100%)",
    accent: "#f59e0b",
    trailerYouTubeId: "qGbvEhKhaWA"
  },
  {
    id: 5,
    title: "Udta Teer",
    genre: ["Comedy", "Action", "Spy"],
    duration: "2h 05m",
    language: "Hindi",
    rating: 6.1,
    certificate: "UA",
    director: "Aakash A. Kaushik",
    cast: ["Ayushmann Khurrana", "Sara Ali Khan", "Manoj Pahwa", "Kumud Mishra"],
    synopsis: "An amnesiac Pakistani spy wakes up believing he is a patriotic Indian counter-terrorism officer. Caught between two identities and two nations, he must figure out who he really is before both sides catch up with him — in this razor-sharp action comedy.",
    poster: "https://image.tmdb.org/t/p/w500/tvICKypVlW7Iio4KVs7NousbSKi.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ncVecUcDZe1EOWtHaU2f8BFvbx4.jpg",
    gradient: "linear-gradient(135deg, #065f46 0%, #064e3b 50%, #0a0f0d 100%)",
    accent: "#10b981",
    trailerYouTubeId: "hN_ZUElLH44"
  },
  {
    id: 6,
    title: "Nakhrewaalii",
    genre: ["Romance", "Comedy"],
    duration: "2h 10m",
    language: "Hindi",
    rating: 7.2,
    certificate: "UA",
    director: "Rahul Shanklya",
    cast: ["Ansh Duggal", "Pragati Srivastava", "Brijendra Kala", "Seema Pahwa"],
    synopsis: "Sumit Mishra cross-dresses as a woman to win over his love interest Paridhi, leading to the most chaotic and heartwarming romantic comedy of the year. A film about love, identity, and the lengths people go to for the one they adore.",
    poster: "https://image.tmdb.org/t/p/w500/oC8kSyOdioegcXl8OfcG6uctyK2.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/kkNZzSG0vWhetsbQ74SjVzUyq4s.jpg",
    gradient: "linear-gradient(135deg, #831843 0%, #500724 50%, #1c0413 100%)",
    accent: "#f472b6",
    trailerYouTubeId: "Gw5_UTgjVgY"
  }
];

const SHOWTIMES = ["10:00 AM", "1:15 PM", "4:30 PM", "7:45 PM", "10:30 PM"];

const FB_MENU = {
  combos: [
    { id: "c1", name: "Classic Combo", desc: "M Popcorn + Pepsi 500ml", price: 350, icon: "popcorn" },
    { id: "c2", name: "Jumbo Combo", desc: "L Popcorn + 2 Pepsi 750ml", price: 520, icon: "popcorn" },
    { id: "c3", name: "Nachos Combo", desc: "Nachos + Salsa + Pepsi", price: 380, icon: "nachos" }
  ],
  popcorn: [
    { id: "p1", name: "Salted — Small", desc: "Classic salted popcorn", price: 180, icon: "popcorn" },
    { id: "p2", name: "Salted — Medium", desc: "Classic salted popcorn", price: 250, icon: "popcorn" },
    { id: "p3", name: "Salted — Large", desc: "Classic salted popcorn", price: 310, icon: "popcorn" },
    { id: "p4", name: "Caramel — Small", desc: "Sweet caramel popcorn", price: 180, icon: "popcorn" },
    { id: "p5", name: "Caramel — Medium", desc: "Sweet caramel popcorn", price: 250, icon: "popcorn" },
    { id: "p6", name: "Caramel — Large", desc: "Sweet caramel popcorn", price: 310, icon: "popcorn" }
  ],
  beverages: [
    { id: "b1", name: "Pepsi", desc: "500ml", price: 160, icon: "drink" },
    { id: "b2", name: "7UP", desc: "500ml", price: 160, icon: "drink" },
    { id: "b3", name: "Mountain Dew", desc: "500ml", price: 160, icon: "drink" },
    { id: "b4", name: "Aquafina Water", desc: "1L", price: 60, icon: "water" },
    { id: "b5", name: "Cold Coffee", desc: "Chilled brew", price: 180, icon: "coffee" }
  ],
  snacks: [
    { id: "s1", name: "Nachos with Salsa", desc: "Crispy nachos + dip", price: 220, icon: "nachos" },
    { id: "s2", name: "Hot Dog", desc: "Classic grilled", price: 240, icon: "food" },
    { id: "s3", name: "Paneer Tikka Wrap", desc: "Spicy paneer roll", price: 280, icon: "food" },
    { id: "s4", name: "Brownie with Ice Cream", desc: "Warm brownie + scoop", price: 200, icon: "dessert" }
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
    // Start with empty set — real data fetched from MongoDB via renderSeatSelectionAsync
    BOOKED_SEATS[key] = new Set();
  }
  return BOOKED_SEATS[key];
}

function generateRandomBookedSeats(audiId) {
  // Disabled: seats are now fetched from MongoDB (no fake bookings)
  return new Set();
}

function markSeatsAsBooked(movieId, date, showtime, audiId, seatIds) {
  const key = getShowKey(movieId, date, showtime, audiId);
  if (!BOOKED_SEATS[key]) BOOKED_SEATS[key] = new Set();
  seatIds.forEach(s => BOOKED_SEATS[key].add(s));
}
