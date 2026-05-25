import type { ReviewWithGuest } from "@/types/database";

export const MOCK_REVIEWS: ReviewWithGuest[] = [
  {
    review_id: 1,
    guest_id: 1,
    reservation_id: 101,
    rating: 5,
    review_date: "2026-05-20",
    review_text:
      "Absolutely stunning venue. The master suite was immaculate and the pool area exceeded every expectation. Staff were warm and attentive from arrival to checkout.",
    guests: { first_name: "Sofia", last_name: "Reyes", guest_type: "VIP" },
    reservations: { order_id: "ORD-2026-0101" },
  },
  {
    review_id: 2,
    guest_id: 2,
    reservation_id: 102,
    rating: 4,
    review_date: "2026-05-18",
    review_text:
      "Really enjoyable stay overall. The home theater and game room were highlights. WiFi dropped a couple of times in the evening which was a minor inconvenience.",
    guests: { first_name: "Marco", last_name: "Villanueva", guest_type: "Returning" },
    reservations: { order_id: "ORD-2026-0102" },
  },
  {
    review_id: 3,
    guest_id: 3,
    reservation_id: 103,
    rating: 5,
    review_date: "2026-05-15",
    review_text:
      "Perfect venue for our family reunion. The barkada room and kiddie pool kept everyone happy. We will definitely be back.",
    guests: { first_name: "Carmela", last_name: "Santos", guest_type: "Returning" },
    reservations: { order_id: "ORD-2026-0103" },
  },
  {
    review_id: 4,
    guest_id: 4,
    reservation_id: 104,
    rating: 3,
    review_date: "2026-05-12",
    review_text:
      "The space itself is beautiful but check-in took almost 40 minutes. Once we were settled everything was great, but the process needs improvement.",
    guests: { first_name: "Diego", last_name: "Cruz", guest_type: "New" },
    reservations: { order_id: "ORD-2026-0104" },
  },
  {
    review_id: 5,
    guest_id: 5,
    reservation_id: 105,
    rating: 5,
    review_date: "2026-05-10",
    review_text:
      "Hosted our anniversary here and it was beyond magical. The outdoor dining gazebo with string lights at night was absolutely breathtaking.",
    guests: { first_name: "Isabella", last_name: "Lim", guest_type: "VIP" },
    reservations: { order_id: "ORD-2026-0105" },
  },
  {
    review_id: 6,
    guest_id: 6,
    reservation_id: 106,
    rating: 4,
    review_date: "2026-05-07",
    review_text:
      "Great facilities and cleanliness was top-notch. PS5 setup in the game room was a nice touch. Would love faster response on add-on requests next time.",
    guests: { first_name: "Nathan", last_name: "Tan", guest_type: "Returning" },
    reservations: { order_id: "ORD-2026-0106" },
  },
  {
    review_id: 7,
    guest_id: 7,
    reservation_id: 107,
    rating: 5,
    review_date: "2026-05-03",
    review_text:
      "Our corporate team-building retreat was flawless. The venue handled our group of 20 with ease. Staff were professional and incredibly helpful.",
    guests: { first_name: "Andrea", last_name: "Gomez", guest_type: "VIP" },
    reservations: { order_id: "ORD-2026-0107" },
  },
  {
    review_id: 8,
    guest_id: 8,
    reservation_id: 108,
    rating: 2,
    review_date: "2026-04-29",
    review_text:
      "Compared to our last stay the WiFi was unstable and one of the billiard cues was broken. The place is still lovely but maintenance needs attention.",
    guests: { first_name: "Rafael", last_name: "Mendoza", guest_type: "Returning" },
    reservations: { order_id: "ORD-2026-0108" },
  },
  {
    review_id: 9,
    guest_id: 9,
    reservation_id: 109,
    rating: 5,
    review_date: "2026-04-25",
    review_text:
      "From the wine cellar to the rooftop balcony — every corner of this place is designed with care. The sauna was a wonderful end-of-day treat.",
    guests: { first_name: "Bianca", last_name: "Floresca", guest_type: "New" },
    reservations: { order_id: "ORD-2026-0109" },
  },
  {
    review_id: 10,
    guest_id: 10,
    reservation_id: 110,
    rating: 4,
    review_date: "2026-04-22",
    review_text:
      "Celebrated my daughter's debut here and it was wonderful. Great sound system and the kitchen was fully stocked as requested. A few minor decor touches could be improved.",
    guests: { first_name: "Lorraine", last_name: "Aquino", guest_type: "New" },
    reservations: { order_id: "ORD-2026-0110" },
  },
  {
    review_id: 11,
    guest_id: 11,
    reservation_id: 111,
    rating: 5,
    review_date: "2026-04-18",
    review_text:
      "The gym and fitness area was surprisingly well-equipped. Woke up early to work out before our day activities — highly recommend it for health-conscious guests.",
    guests: { first_name: "Miguel", last_name: "Bautista", guest_type: "Returning" },
    reservations: { order_id: "ORD-2026-0111" },
  },
  {
    review_id: 12,
    guest_id: 12,
    reservation_id: 112,
    rating: 3,
    review_date: "2026-04-14",
    review_text:
      "Nice venue but the amenity setup (billiards table delivery) took over an hour. The place itself is clean and spacious. Just needs a smoother coordination process.",
    guests: { first_name: "Patricia", last_name: "Dela Torre", guest_type: "New" },
    reservations: { order_id: "ORD-2026-0112" },
  },
  {
    review_id: 13,
    guest_id: 13,
    reservation_id: 113,
    rating: 5,
    review_date: "2026-04-10",
    review_text:
      "Celebrated our 10th anniversary here. The VIP guest suite was prepared with rose petals and a welcome note — a thoughtful touch we did not expect.",
    guests: { first_name: "Veronica", last_name: "Chan", guest_type: "VIP" },
    reservations: { order_id: "ORD-2026-0113" },
  },
  {
    review_id: 14,
    guest_id: 14,
    reservation_id: 114,
    rating: 4,
    review_date: "2026-04-06",
    review_text:
      "Bar and lounge area was fantastic — well-stocked and the glassware was spotless. Pool was clean. Would like to see a cocktail menu available next time.",
    guests: { first_name: "Jerome", last_name: "Ocampo", guest_type: "Returning" },
    reservations: { order_id: "ORD-2026-0114" },
  },
  {
    review_id: 15,
    guest_id: 15,
    reservation_id: 115,
    rating: 5,
    review_date: "2026-03-30",
    review_text:
      "First time booking and I was blown away. Every room was prepared perfectly. The outdoor BBQ area was the highlight of our stay. 10 out of 10.",
    guests: { first_name: "Jasmine", last_name: "Ramos", guest_type: "New" },
    reservations: { order_id: "ORD-2026-0115" },
  },
  {
    review_id: 16,
    guest_id: 16,
    reservation_id: 116,
    rating: 4,
    review_date: "2026-03-25",
    review_text:
      "Beautiful property. The garden and landscape were in perfect shape. Staff responded quickly to all requests. Minor: the parking area lighting could be brighter at night.",
    guests: { first_name: "Carlos", last_name: "Navarro", guest_type: "New" },
    reservations: { order_id: "ORD-2026-0116" },
  },
  {
    review_id: 17,
    guest_id: 17,
    reservation_id: 117,
    rating: 1,
    review_date: "2026-03-20",
    review_text:
      "Very disappointed. The air conditioning in the master suite was not working properly and despite reporting it, it was not fixed during our stay. Expected much better.",
    guests: { first_name: "Raymond", last_name: "Pascual", guest_type: "New" },
    reservations: { order_id: "ORD-2026-0117" },
  },
  {
    review_id: 18,
    guest_id: 18,
    reservation_id: 118,
    rating: 5,
    review_date: "2026-03-15",
    review_text:
      "Third time staying here and it keeps getting better. The team clearly listens to feedback. New outdoor dining setup is a massive upgrade.",
    guests: { first_name: "Melissa", last_name: "Torres", guest_type: "VIP" },
    reservations: { order_id: "ORD-2026-0118" },
  },
  {
    review_id: 19,
    guest_id: 19,
    reservation_id: 119,
    rating: 4,
    review_date: "2026-03-10",
    review_text:
      "Hosted a bachelorette weekend here and it was a blast. The home theater and karaoke setup in the living room had us entertained all night.",
    guests: { first_name: "Danielle", last_name: "Fernandez", guest_type: "Returning" },
    reservations: { order_id: "ORD-2026-0119" },
  },
  {
    review_id: 20,
    guest_id: 20,
    reservation_id: 120,
    rating: 5,
    review_date: "2026-03-05",
    review_text:
      "Impeccable service and an even more impeccable property. The library and study room was a quiet retreat after a long day. Highly recommended for families.",
    guests: { first_name: "Elaine", last_name: "Soriano", guest_type: "VIP" },
    reservations: { order_id: "ORD-2026-0120" },
  },
];
