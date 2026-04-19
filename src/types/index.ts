export type EngineType = "manual" | "ev" | "hybrid" | "electric";
export type CarStatus = "ready" | "rented" | "maintenance";
export type Role = "admin" | "user";
export type PaymentMethod = "transfer" | "qris";
export type PaymentStatus = "pending" | "approved" | "rejected";
export type BookingStatus = "awaiting_payment" | "active" | "returned" | "overdue" | "cancelled";

export interface Car {
  id: number | string; // Biar aman untuk Laravel (number) & Mock (string)
  name: string;        // Wajib (Laravel)
  type: string;        // Wajib (Laravel)
  daily_price: number;
  status: "ready" | "rented" | "maintenance";
  
  // Properti pendukung (opsional agar tidak error)
  brand?: string;
  model?: string;
  year?: number;
  plate?: string;
  engine?: EngineType | string; 
  seats?: number;
  transmission?: string;
  image_url?: string;
  description?: string;
  fine_pct_per_hour?: number;
}
export interface User {
  id: string | number;
  name: string;
  email: string;
  role: "user" | "admin";
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
