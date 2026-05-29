import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase.js";
import GlassCard from "./shared/GlassCard.jsx";

export default function Auth({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (mode === "signup" && data?.user?.identities?.length === 0) {
      setError("An account with this email already exists");
      return;
    }

    if (data?.session) {
      onAuth(data.session);
    } else if (mode === "signup") {
      setError("Check your email for confirmation link");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        fontFamily: "'Space Mono', monospace",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Orbitron:wght@700;900&display=swap"
        rel="stylesheet"
      />
      <GlassCard style={{ maxWidth: 400, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 900,
              fontSize: "1.3rem",
              color: "#39ff14",
              letterSpacing: "0.05em",
              marginBottom: "0.5rem",
            }}
          >
            GRIND<span style={{ color: "#fff" }}>TRACKER</span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "#555", letterSpacing: "0.1em" }}>
            {mode === "signin" ? "SIGN IN" : "SIGN UP"}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.6rem 0.75rem",
                background: "#111",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                color: "#e8e8e8",
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.8rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: "100%",
                padding: "0.6rem 0.75rem",
                background: "#111",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                color: "#e8e8e8",
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.8rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "0.5rem 0.75rem",
                background: "rgba(255,69,58,0.1)",
                border: "1px solid rgba(255,69,58,0.3)",
                borderRadius: 6,
                fontSize: "0.7rem",
                color: "#ff453a",
                marginBottom: "1rem",
              }}
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.7rem",
              background: loading ? "#333" : "#39ff14",
              border: "none",
              borderRadius: 8,
              color: loading ? "#888" : "#000",
              fontWeight: 700,
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.85rem",
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "0.05em",
              marginBottom: "1rem",
            }}
          >
            {loading ? "PLEASE WAIT..." : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
        </form>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
            style={{
              background: "none",
              border: "none",
              color: "#555",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.7rem",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {mode === "signin" ? "No account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
