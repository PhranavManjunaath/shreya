import { useState } from "react";
import { motion } from "framer-motion";
import { SECTIONS } from "../lib/constants.js";
import GlassCard from "./shared/GlassCard.jsx";
import PageHeader from "./shared/PageHeader.jsx";
import PriorityDot from "./shared/PriorityDot.jsx";

export default function Tasks({ tasks, setTasks }) {
  const [editing, setEditing] = useState(null);
  const [newText, setNewText] = useState({});
  const [newPriority, setNewPriority] = useState({});

  const addTask = (section) => {
    const text = (newText[section] || "").trim();
    if (!text || text.length > 500) return;
    setTasks((ts) => [
      ...ts,
      {
        id: crypto.randomUUID(),
        section,
        text,
        done: false,
        priority: newPriority[section] || "medium",
      },
    ]);
    setNewText((t) => ({ ...t, [section]: "" }));
  };

  const toggle = (id) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const del = (id) => setTasks((ts) => ts.filter((t) => t.id !== id));
  const save = (id, text) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, text } : t)));
    setEditing(null);
  };

  return (
    <div>
      <PageHeader title="Task Board" sub="Manage your gym, work, and habits" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {SECTIONS.map((sec) => {
          const stasks = tasks.filter((t) => t.section === sec.id);
          const done = stasks.filter((t) => t.done).length;
          return (
            <GlassCard key={sec.id}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.85rem",
                    color: sec.color,
                  }}
                >
                  {sec.label}
                </div>
                <span style={{ fontSize: "0.7rem", color: "#444" }}>
                  {done}/{stasks.length}
                </span>
              </div>
              {stasks.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.5rem 0",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <button
                    onClick={() => toggle(t.id)}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: `2px solid ${t.done ? sec.color : "rgba(255,255,255,0.15)"}`,
                      background: t.done ? sec.color : "transparent",
                      cursor: "pointer",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {t.done && (
                      <span
                        style={{
                          color: "#000",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                  {editing === t.id ? (
                    <input
                      autoFocus
                      defaultValue={t.text}
                      onBlur={(e) => save(t.id, e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && save(t.id, e.target.value)
                      }
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        borderBottom: `1px solid ${sec.color}`,
                        color: "#e8e8e8",
                        fontFamily: "'Space Mono', monospace",
                        fontSize: "0.8rem",
                        outline: "none",
                      }}
                    />
                  ) : (
                    <span
                      onClick={() => setEditing(t.id)}
                      style={{
                        flex: 1,
                        fontSize: "0.8rem",
                        color: t.done ? "#444" : "#ccc",
                        textDecoration: t.done ? "line-through" : "none",
                        cursor: "pointer",
                      }}
                    >
                      {t.text}
                    </span>
                  )}
                  <PriorityDot p={t.priority} />
                  <button
                    onClick={() => del(t.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#333",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </motion.div>
              ))}
              <div
                style={{
                  display: "flex",
                  gap: "0.4rem",
                  marginTop: "0.75rem",
                }}
              >
                <input
                  value={newText[sec.id] || ""}
                  onChange={(e) =>
                    setNewText((t) => ({ ...t, [sec.id]: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && addTask(sec.id)}
                  placeholder="Add task..."
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 6,
                    color: "#888",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.75rem",
                    padding: "0.4rem 0.6rem",
                    outline: "none",
                  }}
                />
                <select
                  value={newPriority[sec.id] || "medium"}
                  onChange={(e) =>
                    setNewPriority((p) => ({ ...p, [sec.id]: e.target.value }))
                  }
                  style={{
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 6,
                    color: "#555",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.7rem",
                    padding: "0.4rem",
                  }}
                >
                  <option value="high">High</option>
                  <option value="medium">Med</option>
                  <option value="low">Low</option>
                </select>
                <button
                  onClick={() => addTask(sec.id)}
                  style={{
                    background: sec.color,
                    border: "none",
                    borderRadius: 6,
                    color: "#000",
                    fontWeight: 700,
                    fontSize: "1rem",
                    width: 32,
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
