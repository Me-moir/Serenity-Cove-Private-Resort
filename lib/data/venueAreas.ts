export const ALL_AREA_NAMES = [
  // Floor 3
  "Master Suite",
  "Private Balcony",
  // Floor 2
  "VIP Guest Suite",
  "Guest Suite 1",
  "Guest Suite 2",
  "Barkada Room",
  "Kiddie Room",
  "Library / Study",
  // Floor 1
  "Grand Foyer",
  "Living Room",
  "Bar & Lounge",
  "Kitchen & Dining",
  "Home Theater",
  "Gym / Fitness",
  "Main Bathroom",
  // Basement
  "Wine Cellar",
  "Game Room",
  "Sauna Room",
  // Outdoor
  "Main Pool",
  "Kiddie Pool",
  "BBQ & Grill Area",
  "Garden & Landscape",
  "Outdoor Dining",
  "Parking Area",
] as const;

export type AreaName = (typeof ALL_AREA_NAMES)[number];
