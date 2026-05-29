import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase.js";
import Auth from "./Auth.jsx";
import GrindTracker from "./GrindTracker.jsx";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
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
    return <Auth />;
  }

  return <GrindTracker session={session} />;
}
