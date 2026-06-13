export const categories = ["Books", "Cycles", "Electronics", "Hostel", "Lab Gear", "Sports", "Campus Radar", "Other"];
export const conditions = ["Like New", "Good", "Fair", "Needs Repair"];
export const meetupSpots = [
  "A Block",
  "B Block",
  "C Block",
  "D Block",
  "E Block",
  "F Block",
  "G Block",
  "H Block",
  "I Block",
  "I Block Canteen",
  "D Block Canteen",
  "Readers",
  "Cricket Ground",
  "Basketball Court",
  "Sports Complex",
  "Girls Hostel",
  "Boys Hostel",
  "D Block Library",
  "G Block Library",
  "D Auditorium",
  "APJ Hall"
];

export const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price || 0);
