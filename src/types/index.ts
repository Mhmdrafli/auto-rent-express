export type EngineType = "manual" | "ev" | "hybrid";
export type CarStatus = "ready" | "rented" | "maintenance";
export type Role = "admin" | "user";
export type PaymentMethod = "transfer" | "qris";
export type PaymentStatus = "pending" | "approved" | "rejected";
export type BookingStatus = "awaiting_payment" | "active" | "returned" | "overdue" | "cancelled";

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  engine: EngineType;
  seats: number;
  transmission: string;
  daily_price: number;
  fine_pct_per_hour: number; // % of daily price per overdue hour
  status: CarStatus;
  image_url: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
}

export interface Payment {
  id: string;
  booking_id: string;
  method: PaymentMethod;
  amount: number;
  proof_url?: string;
  status: PaymentStatus;
  created_at: string;
}

export interface Booking {
  id: string;
  car_id: string;
  user_id: string;
  start_at: string;   // ISO
  end_at: string;     // ISO planned return
  returned_at?: string;
  status: BookingStatus;
  base_total: number; // daily_price * days
  fine_amount: number;
  payment?: Payment;
  // joined for convenience
  car?: Car;
  user?: User;
}
