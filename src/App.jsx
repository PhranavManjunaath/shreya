import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase.js";
import GrindTracker from "./GrindTracker.jsx";
import Auth from "./components/Auth.jsx";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#555",
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.8rem",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Auth onAuth={(s) => setSession(s)} />;
  }

  return <GrindTracker user={session.user} />;
}
