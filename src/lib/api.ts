
import type { Booking, Car, Payment } from "@/types";
import { mockCars, mockBookings } from "./mock-data";

const MOCK = !import.meta.env.VITE_API_BASE_URL;
const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

// src/lib/api.ts - ganti function request
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("rental_token");
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...init,
  });
  if (!res.ok) throw new Error((await res.text()) || res.statusText);
  return res.json();
}

// ---- in-memory mock store (mirrors what Laravel will return)
let _cars = [...mockCars];
let _bookings = [...mockBookings];

function delay<T>(v: T): Promise<T> { return new Promise((r) => setTimeout(() => r(v), 250)); }

export const carsApi = {
  list: () => (MOCK ? delay(_cars) : request<Car[]>("/api/cars")),
  get: (id: string) => (MOCK ? delay(_cars.find((c) => c.id === id)!) : request<Car>(`/api/cars/${id}`)),
  create: (car: Omit<Car, "id">) => {
    if (MOCK) {
      const created = { ...car, id: crypto.randomUUID() };
      _cars = [created, ..._cars];
      return delay(created);
    }
    return request<Car>("/api/cars", { method: "POST", body: JSON.stringify(car) });
  },
  update: (id: string, patch: Partial<Car>) => {
    if (MOCK) {
      _cars = _cars.map((c) => (c.id === id ? { ...c, ...patch } : c));
      return delay(_cars.find((c) => c.id === id)!);
    }
    return request<Car>(`/api/cars/${id}`, { method: "PUT", body: JSON.stringify(patch) });
  },
  remove: (id: string) => {
    if (MOCK) {
      _cars = _cars.filter((c) => c.id !== id);
      return delay({ ok: true });
    }
    return request<{ ok: true }>(`/api/cars/${id}`, { method: "DELETE" });
  },
};

export const bookingsApi = {
  list: (userId?: string) => {
    if (MOCK) {
      const data = (userId ? _bookings.filter((b) => b.user_id === userId) : _bookings).map((b) => ({
        ...b,
        car: _cars.find((c) => c.id === b.car_id),
      }));
      return delay(data);
    }
    return request<Booking[]>(`/api/bookings${userId ? `?user_id=${userId}` : ""}`);
  },
  create: (input: { car_id: string; user_id: string; start_at: string; end_at: string }) => {
    if (MOCK) {
      const car = _cars.find((c) => c.id === input.car_id)!;
      const days = Math.max(1, Math.ceil((+new Date(input.end_at) - +new Date(input.start_at)) / (1000 * 60 * 60 * 24)));
      const booking: Booking = {
        id: crypto.randomUUID(),
        ...input,
        status: "awaiting_payment",
        base_total: car.daily_price * days,
        fine_amount: 0,
      };
      _bookings = [booking, ..._bookings];
      _cars = _cars.map((c) => (c.id === car.id ? { ...c, status: "rented" } : c));
      return delay({ ...booking, car });
    }
    return request<Booking>("/api/bookings", { method: "POST", body: JSON.stringify(input) });
  },
  returnCar: (id: string, returned_at: string) => {
    if (MOCK) {
      _bookings = _bookings.map((b) => {
        if (b.id !== id) return b;
        const car = _cars.find((c) => c.id === b.car_id)!;
        const lateMs = +new Date(returned_at) - +new Date(b.end_at);
        const lateHours = Math.max(0, Math.ceil(lateMs / (1000 * 60 * 60)));
        const fine = lateHours * (car.daily_price * (car.fine_pct_per_hour / 100));
        _cars = _cars.map((c) => (c.id === car.id ? { ...c, status: "ready" } : c));
        return { ...b, returned_at, status: "returned", fine_amount: Math.round(fine) };
      });
      return delay(_bookings.find((b) => b.id === id)!);
    }
    return request<Booking>(`/api/bookings/${id}/return`, { method: "POST", body: JSON.stringify({ returned_at }) });
  },
};

export const paymentsApi = {
  upload: async (input: { booking_id: string; method: "transfer" | "qris"; amount: number; proof: File | null }) => {
    if (MOCK) {
      const proof_url = input.proof ? URL.createObjectURL(input.proof) : undefined;
      const payment: Payment = {
        id: crypto.randomUUID(),
        booking_id: input.booking_id,
        method: input.method,
        amount: input.amount,
        proof_url,
        status: "pending",
        created_at: new Date().toISOString(),
      };
      _bookings = _bookings.map((b) => (b.id === input.booking_id ? { ...b, payment } : b));
      return delay(payment);
    }
 const token = localStorage.getItem("rental_token");
    const fd = new FormData();
    fd.append("booking_id", input.booking_id);
    fd.append("method", input.method);
    fd.append("amount", String(input.amount));
    if (input.proof) fd.append("proof", input.proof);
    const res = await fetch(`${BASE}/api/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        // JANGAN tambahkan Content-Type, biarkan browser set otomatis untuk FormData
      },
      body: fd,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<Payment>;
  },
  decide: (id: string, decision: "approved" | "rejected") => {
    if (MOCK) {
      _bookings = _bookings.map((b) => {
        if (b.payment?.id !== id) return b;
        const payment = { ...b.payment, status: decision } as Payment;
        return { ...b, payment, status: decision === "approved" ? "active" : "awaiting_payment" };
      });
      return delay({ ok: true });
    }
    return request(`/api/payments/${id}/${decision === "approved" ? "approve" : "reject"}`, { method: "POST" });
  },
};
