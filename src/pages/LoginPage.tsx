import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Login gagal, periksa email & password.");
    }
  };

  const fillDemo = (role: "user" | "admin") => {
    setEmail(role === "admin" ? "admin@drivelinerental.com" : "andi@gmail.com");
    setPassword("password");
    setError("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Google Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Bebas+Neue&display=swap"
        rel="stylesheet"
      />

      {/* Background decoration */}
      <div style={{
        position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
      }}>
        <div style={{
          position: "absolute", top: "-20%", right: "-10%",
          width: "600px", height: "600px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", left: "-10%",
          width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
        }} />
        {/* Grid lines */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
      </div>

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: "420px",
        margin: "0 16px",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>
        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            marginBottom: "8px",
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "8px",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <a href="public\logo.png" target="_blank" rel="noopener noreferrer">
                <img src="public\logo.png" alt="DriveLine Logo" style={{ width: "24px", height: "24px" }} />
              </a>
            </div>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "22px", letterSpacing: "2px",
              color: "#fff",
            }}>DriveLine</span>
          </div>
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
            Platform Rental Mobil Terpercaya
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "36px",
          backdropFilter: "blur(20px)",
        }}>
          <h1 style={{
            color: "#fff", fontSize: "22px", fontWeight: 600,
            margin: "0 0 6px",
          }}>Masuk ke Akun</h1>
          <p style={{ color: "#6b7280", fontSize: "13px", margin: "0 0 28px" }}>
            Belum punya akun?{" "}
            <span style={{ color: "#6366f1", cursor: "pointer" }}>Daftar sekarang</span>
          </p>

          {/* Demo buttons */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
            {(["user", "admin"] as const).map((role) => (
              <button
                key={role}
                onClick={() => fillDemo(role)}
                style={{
                  flex: 1, padding: "8px", borderRadius: "8px", cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#9ca3af", fontSize: "12px", fontWeight: 500,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = "rgba(99,102,241,0.15)";
                  (e.target as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.4)";
                  (e.target as HTMLButtonElement).style.color = "#a5b4fc";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                  (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                  (e.target as HTMLButtonElement).style.color = "#9ca3af";
                }}
              >
                Demo {role === "admin" ? "Admin" : "User"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block", color: "#d1d5db", fontSize: "13px",
                fontWeight: 500, marginBottom: "6px",
              }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", fontSize: "14px", outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "8px" }}>
              <label style={{
                display: "block", color: "#d1d5db", fontSize: "13px",
                fontWeight: 500, marginBottom: "6px",
              }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", fontSize: "14px", outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                margin: "12px 0", padding: "10px 14px", borderRadius: "8px",
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                color: "#fca5a5", fontSize: "13px",
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%", marginTop: "20px",
                padding: "12px", borderRadius: "10px", border: "none",
                background: isLoading
                  ? "rgba(99,102,241,0.5)"
                  : "linear-gradient(135deg, #6366f1, #4f46e5)",
                color: "#fff", fontSize: "14px", fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                letterSpacing: "0.3px",
              }}
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: "center", color: "#374151", fontSize: "12px", marginTop: "24px",
        }}>
          © 2026 DriveLine Rental · All rights reserved
        </p>
      </div>
    </div>
  );
}