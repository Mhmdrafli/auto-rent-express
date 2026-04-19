import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Role, User } from "@/types";

interface AuthCtx {
  user: User;
  setRole: (role: Role) => void;
}

const defaultUser: User = { id: "u1", name: "Andi Wijaya", email: "andi@example.com", role: "user" };
const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    const raw = localStorage.getItem("rental_user");
    return raw ? JSON.parse(raw) : defaultUser;
  });
  useEffect(() => { localStorage.setItem("rental_user", JSON.stringify(user)); }, [user]);
  return <Ctx.Provider value={{ user, setRole: (role) => setUser((u) => ({ ...u, role })) }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
