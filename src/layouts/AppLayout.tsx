import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Car as CarIcon, LayoutDashboard, ShieldCheck, LogOut, UserCircle2, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);

  const navItems = [
    { to: "/", label: "Mobil", icon: CarIcon },
    { to: "/dashboard", label: "Dashboard Saya", icon: LayoutDashboard, hide: !user || user.role === "admin" },
    { to: "/admin", label: "Admin", icon: ShieldCheck, hide: !user || user.role !== "admin" },
  ].filter((i) => !i.hide);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between gap-4">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-card">
              <CarIcon className="h-5 w-5" />
            </span>
            <span className="hidden sm:inline">DriveLine</span>
          </Link>

          {/* HAMBURGER BUTTON (HP) */}
          <button
            className="sm:hidden"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* NAV DESKTOP */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* USER SECTION DESKTOP */}
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <UserCircle2 className="h-4 w-4" />
                  {user.name}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-1.5 h-4 w-4" />
                  Keluar
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => navigate("/login")}>
                Masuk
              </Button>
            )}
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenu && (
          <div className="sm:hidden border-t bg-background px-4 py-3 space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenu(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}

            <div className="pt-2 border-t">
              {user ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => {
                    setMobileMenu(false);
                    navigate("/login");
                  }}
                >
                  Masuk
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* CONTENT */}
      <main key={location.pathname} className="flex-1 animate-fade-in">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="mt-16 border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} DriveLine Rental · Reserved all 2026
      </footer>

    </div>
  );
}