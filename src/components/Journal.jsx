import { useState } from "react";
import { motion } from "framer-motion";
import { today, fmtDate } from "../lib/helpers.js";
import GlassCard from "./shared/GlassCard.jsx";
import PageHeader from "./shared/PageHeader.jsx";

export default function Journal({ journal, setJournal }) {
  const [text, setText] = useState("");
  const add = () => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 2000) return;
    setJournal((j) => [
      { id: crypto.randomUUID(), date: today(), text: trimmed },
      ...j,
    ]);
    setText("");
  };
  return (
    <div>
      <PageHeader title="Journal" sub="Reflect on your grind" />
      <GlassCard style={{ marginBottom: "1.5rem" }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What did you accomplish today? What can be improved?"
          style={{
            width: "100%",
            minHeight: 100,
            background: "transparent",
            border: "none",
            color: "#ccc",
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.85rem",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            lineHeight: 1.7,
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "0.75rem",
          }}
        >
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={add}
            style={{
              padding: "0.5rem 1.5rem",
              background: "#39ff14",
              border: "none",
              borderRadius: 6,
              color: "#000",
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            SAVE ENTRY
          </motion.button>
        </div>
      </GlassCard>
      {journal.map((e) => (
        <GlassCard key={e.id} style={{ marginBottom: "0.75rem" }}>
          <div
            style={{
              fontSize: "0.65rem",
              color: "#39ff14",
              letterSpacing: "0.1em",
              marginBottom: "0.5rem",
            }}
          >
            {fmtDate(e.date)}
          </div>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#aaa",
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            {e.text}
          </p>
        </GlassCard>
      ))}
    </div>
  );
}
