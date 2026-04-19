import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "./layouts/AppLayout";
import CarsPage from "./pages/CarsPage";
import CarDetailPage from "./pages/CarDetailPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminOnly({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function GuestOnly({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Guest only */}
            <Route
              path="/login"
              element={
                <GuestOnly>
                  <LoginPage />
                </GuestOnly>
              }
            />

            {/* App routes with layout */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<CarsPage />} />
              <Route path="/cars/:id" element={<CarDetailPage />} />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <UserDashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminOnly>
                    <AdminDashboard />
                  </AdminOnly>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;