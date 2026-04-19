import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User } from "@/types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("rental_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("rental_token")
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem("rental_user", JSON.stringify(user));
    else localStorage.removeItem("rental_user");
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem("rental_token", token);
    else localStorage.removeItem("rental_token");
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Login gagal");
      }
      const data = await res.json();
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${BASE}/api/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (_) {}
    setUser(null);
    setToken(null);
  };

  return (
    <Ctx.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}