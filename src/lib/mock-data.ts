import type { Booking, Car } from "@/types";

const now = Date.now();
const day = 86_400_000;

export const mockCars: Car[] = [
  {
    id: "c1", brand: "Toyota", model: "Avanza", year: 2023, plate: "B 1234 ABC",
    engine: "manual", seats: 7, transmission: "Manual 5-speed",
    daily_price: 350_000, fine_pct_per_hour: 10, status: "ready",
    image_url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
    description: "MPV andalan keluarga, irit dan luas.",
  },
  {
    id: "c2", brand: "Hyundai", model: "Ioniq 5", year: 2024, plate: "B 9090 EV",
    engine: "ev", seats: 5, transmission: "Single-speed",
    daily_price: 950_000, fine_pct_per_hour: 12, status: "ready",
    image_url: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80",
    description: "EV premium dengan fast charging.",
  },
  {
    id: "c3", brand: "Toyota", model: "Innova Zenix Hybrid", year: 2024, plate: "B 7777 HV",
    engine: "hybrid", seats: 7, transmission: "e-CVT",
    daily_price: 800_000, fine_pct_per_hour: 10, status: "rented",
    image_url: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80",
    description: "MPV hybrid mewah, halus dan irit.",
  },
  {
    id: "c4", brand: "Honda", model: "Brio", year: 2023, plate: "B 2211 BR",
    engine: "manual", seats: 5, transmission: "Manual 5-speed",
    daily_price: 280_000, fine_pct_per_hour: 8, status: "ready",
    image_url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
    description: "City car lincah untuk dalam kota.",
  },
  {
    id: "c5", brand: "BYD", model: "Atto 3", year: 2024, plate: "B 4455 EV",
    engine: "ev", seats: 5, transmission: "Single-speed",
    daily_price: 750_000, fine_pct_per_hour: 12, status: "ready",
    image_url: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80",
    description: "SUV listrik dengan jangkauan jauh.",
  },
  {
    id: "c6", brand: "Suzuki", model: "Ertiga Hybrid", year: 2024, plate: "B 3322 HV",
    engine: "hybrid", seats: 7, transmission: "AT 4-speed",
    daily_price: 450_000, fine_pct_per_hour: 9, status: "ready",
    image_url: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
    description: "MPV hybrid terjangkau.",
  },
];

export const mockBookings: Booking[] = [
  {
    id: "b1", car_id: "c3", user_id: "u1",
    start_at: new Date(now - 2 * day).toISOString(),
    end_at: new Date(now + 1 * day).toISOString(),
    status: "active", base_total: 2_400_000, fine_amount: 0,
    payment: { id: "p1", booking_id: "b1", method: "transfer", amount: 2_400_000, status: "approved", created_at: new Date(now - 2 * day).toISOString() },
  },
];
