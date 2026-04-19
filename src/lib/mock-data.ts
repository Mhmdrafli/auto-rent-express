import type { Booking, Car } from "@/types";

const now = Date.now();
const day = 86_400_000;

export const mockCars: Car[] = [
{
  id: "1",
  name: "Toyota Avanza", // Tambahkan ini
  type: "manual",       // Tambahkan ini
  // brand, model, engine tetap boleh ada tapi name & type WAJIB ada
  brand: "Toyota", model: "Avanza", year: 2023, plate: "B 1234 ABC",
  engine: "manual", seats: 7, transmission: "Manual 5-speed",
  daily_price: 350_000, fine_pct_per_hour: 10, status: "ready",
  image_url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
  description: "MPV andalan keluarga, irit dan luas.",
}
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
