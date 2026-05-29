import { useState } from "react";
import { motion } from "framer-motion";
import { today, fmtDate } from "../lib/helpers.js";
import GlassCard from "./shared/GlassCard.jsx";
import PageHeader from "./shared/PageHeader.jsx";

export default function Journal({ journal, setJournal }) {
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const add = () => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 2000) return;
    setJournal((j) => [
      { id: crypto.randomUUID(), date: today(), text: trimmed },
      ...j,
    ]);
    setText("");
  };

  const remove = (id) => setJournal((j) => j.filter((e) => e.id !== id));

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditText(entry.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = (id) => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed.length > 2000) return;
    setJournal((j) =>
      j.map((e) => (e.id === id ? { ...e, text: trimmed } : e))
    );
    cancelEdit();
  };

  const btnStyle = {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 4,
    color: "#555",
    fontFamily: "'Space Mono', monospace",
    fontSize: "0.6rem",
    padding: "0.25rem 0.5rem",
    cursor: "pointer",
    letterSpacing: "0.05em",
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <span
              style={{
                fontSize: "0.65rem",
                color: "#39ff14",
                letterSpacing: "0.1em",
              }}
            >
              {fmtDate(e.date)}
            </span>
            {editingId === e.id ? (
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => saveEdit(e.id)}
                  style={{ ...btnStyle, color: "#39ff14", borderColor: "rgba(57,255,20,0.3)" }}
                >
                  SAVE
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={cancelEdit}
                  style={btnStyle}
                >
                  CANCEL
                </motion.button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => startEdit(e)}
                  style={btnStyle}
                >
                  EDIT
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => remove(e.id)}
                  style={btnStyle}
                >
                  DELETE
                </motion.button>
              </div>
            )}
          </div>
          {editingId === e.id ? (
            <textarea
              value={editText}
              onChange={(x) => setEditText(x.target.value)}
              style={{
                width: "100%",
                minHeight: 80,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 6,
                color: "#ccc",
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.85rem",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
                lineHeight: 1.7,
                padding: "0.5rem",
              }}
            />
          ) : (
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
          )}
        </GlassCard>
      ))}
    </div>
  );
}
