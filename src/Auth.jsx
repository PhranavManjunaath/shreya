import { useState } from "react";
import { supabase } from "./lib/supabase.js";

export default function Auth({ initialError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError || null);
  const [mode, setMode] = useState("login");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fn =
      mode === "login"
        ? supabase.auth.signInWithPassword
        : supabase.auth.signUp;

    const { error: err } = await fn({ email, password });

    if (err) {
      setError(err.message);
    if (mode === "signup") {
      setError("Account created! Check your email for confirmation.");
    }
    setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        fontFamily: "'Space Mono', monospace",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Orbitron:wght@700;900&display=swap"
        rel="stylesheet"
      />
      <div
        style={{
          width: 380,
          padding: "2.5rem",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(57,255,20,0.15)",
          borderRadius: 16,
        }}
      >
        <div
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 900,
            fontSize: "1.3rem",
            color: "#39ff14",
            textAlign: "center",
            marginBottom: "0.5rem",
            letterSpacing: "0.05em",
          }}
        >
          GRIND<span style={{ color: "#fff" }}>TRACKER</span>
        </div>
        <p
          style={{
            color: "#444",
            fontSize: "0.75rem",
            textAlign: "center",
            marginBottom: "2rem",
            letterSpacing: "0.1em",
          }}
        >
          {mode === "login" ? "SIGN IN TO CONTINUE" : "CREATE YOUR ACCOUNT"}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.75rem 1rem",
              marginBottom: "0.75rem",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#e8e8e8",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.85rem",
              outline: "none",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.75rem 1rem",
              marginBottom: "1.5rem",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#e8e8e8",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.85rem",
              outline: "none",
            }}
          />

          {error && (
            <p
              style={{
                color: error.includes("Check your email")
                  ? "#39ff14"
                  : "#ff453a",
                fontSize: "0.75rem",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.85rem",
              background: "#39ff14",
              border: "none",
              borderRadius: 8,
              color: "#000",
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "0.05em",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? "PLEASE WAIT..."
              : mode === "login"
                ? "SIGN IN"
                : "CREATE ACCOUNT"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
            }}
            style={{
              background: "none",
              border: "none",
              color: "#555",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.75rem",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {mode === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
