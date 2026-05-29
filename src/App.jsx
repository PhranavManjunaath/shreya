import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase.js";
import Auth from "./Auth.jsx";
import GrindTracker from "./GrindTracker.jsx";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const timeout = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 4000);

    supabase.auth.getSession()
      .then(({ data: { session: s } }) => {
        if (cancelled) return;
        setSession(s);
        clearTimeout(timeout);
        setLoading(false);
      })
      .catch((err) => {
        console.error("getSession error:", err);
        if (cancelled) return;
        clearTimeout(timeout);
        setError(err?.message || "Connection failed");
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          fontFamily: "'Orbitron', sans-serif",
          color: "#39ff14",
          fontSize: "1.2rem",
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Orbitron:wght@700;900&display=swap"
          rel="stylesheet"
        />
        LOADING...
      </div>
    );
  }

  if (!session) {
    return <Auth initialError={error} />;
  }

  return <GrindTracker session={session} />;
}
