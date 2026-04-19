import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Car as CarIcon, LayoutDashboard, ShieldCheck, UserCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AppLayout() {
  const { user, setRole } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Mobil", icon: CarIcon },
    { to: "/dashboard", label: "Dashboard Saya", icon: LayoutDashboard, hide: user.role === "admin" },
    { to: "/admin", label: "Admin", icon: ShieldCheck, hide: user.role !== "admin" },
  ].filter((i) => !i.hide);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-card">
              <CarIcon className="h-5 w-5" />
            </span>
            <span className="hidden sm:inline">DriveLine</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  cn("inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-smooth",
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")
                }
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant={user.role === "admin" ? "default" : "outline"}
              size="sm"
              onClick={() => setRole(user.role === "admin" ? "user" : "admin")}
              title="Toggle role (demo)"
            >
              <UserCircle2 className="mr-1.5 h-4 w-4" />
              {user.role === "admin" ? "Admin" : "User"}
            </Button>
          </div>
        </div>
      </header>

      <main key={location.pathname} className="animate-fade-in">
        <Outlet />
      </main>

      <footer className="mt-16 border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} DriveLine Rental · Frontend siap dihubungkan ke Laravel 12 API
      </footer>
    </div>
  );
}
