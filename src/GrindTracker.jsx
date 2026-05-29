import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { today } from "./lib/helpers.js";
import { BADGES } from "./lib/constants.js";
import useMediaQuery from "./lib/useMediaQuery.js";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Tasks from "./components/Tasks.jsx";
import Analytics from "./components/Analytics.jsx";
import CalendarView from "./components/CalendarView.jsx";
import Pomodoro from "./components/Pomodoro.jsx";
import Journal from "./components/Journal.jsx";
import CalorieTracker from "./components/CalorieTracker.jsx";
import ProgressiveOverload from "./components/ProgressiveOverload.jsx";
import BadgesPage from "./components/BadgesPage.jsx";

const K = (key) => `gt_${key}`;

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(K(key));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const save = (key, data) => {
  try {
    localStorage.setItem(K(key), JSON.stringify(data));
  } catch {}
};

export default function GrindTracker() {
  const [tasks, setTasks] = useState(() => load("tasks", []));
  const [history, setHistory] = useState(() => load("history", []));
  const [journal, setJournal] = useState(() => load("journal", []));
  const [water, setWater] = useState(() => load("water", 0));
  const [nav, setNav] = useState("dashboard");

  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroMode, setPomodoroMode] = useState("work");
  const pomoRef = useRef(null);
  const pomodoroModeRef = useRef("work");

  const isMobile = useMediaQuery("(max-width: 767px)");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNav = (id) => {
    setNav(id);
    if (isMobile) setSidebarOpen(false);
  };

  useEffect(() => {
    pomodoroModeRef.current = pomodoroMode;
  }, [pomodoroMode]);

  useEffect(() => {
    save("tasks", tasks);
  }, [tasks]);

  useEffect(() => {
    save("history", history);
  }, [history]);

  useEffect(() => {
    save("journal", journal);
  }, [journal]);

  useEffect(() => {
    save("water", water);
  }, [water]);

  const todayHistory = useMemo(() => {
    const gym = tasks.filter((t) => t.section === "gym" && t.done).length;
    const work = tasks.filter((t) => t.section === "work" && t.done).length;
    const habits = tasks.filter((t) => t.section === "habits" && t.done).length;
    const completed = gym + work + habits;
    const total = tasks.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { date: today(), gym, work, habits, pct };
  }, [tasks]);

  const mergedHistory = useMemo(() => {
    const filtered = history.filter((h) => h.date !== today());
    const todayEntry = history.find((h) => h.date === today());
    return [...filtered, { ...todayEntry, ...todayHistory }].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [history, todayHistory]);

  useEffect(() => {
    setHistory((prev) => {
      const idx = prev.findIndex((h) => h.date === today());
      if (idx === -1) return [...prev, todayHistory];
      const next = [...prev];
      next[idx] = { ...next[idx], ...todayHistory };
      return next;
    });
  }, [todayHistory]);

  const completedToday = tasks.filter((t) => t.done).length;
  const totalToday = tasks.length;
  const pctToday =
    totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  const xp = mergedHistory.reduce((a, d) => a + d.pct, 0) + pctToday * 2;
  const level = Math.floor(xp / 300) + 1;
  const levelPct = ((xp % 300) / 300) * 100;
  const streak = (() => {
    let s = 0;
    for (let i = mergedHistory.length - 1; i >= 0; i--) {
      if (mergedHistory[i].pct >= 50) s++;
      else break;
    }
    return s;
  })();
  const totalGym = mergedHistory.reduce((a, d) => a + d.gym, 0);
  const totalWork = mergedHistory.reduce((a, d) => a + d.work, 0);
  const stats = { streak, xp, totalGym, totalWork, water };
  const earnedBadges = BADGES.filter((b) => b.req(stats));

  useEffect(() => {
    if (pomodoroActive) {
      pomoRef.current = setInterval(() => {
        setPomodoroTime((t) => {
          if (t <= 1) {
            clearInterval(pomoRef.current);
            setPomodoroActive(false);
            const currentMode = pomodoroModeRef.current;
            setPomodoroMode(currentMode === "work" ? "break" : "work");
            return currentMode === "work" ? 5 * 60 : 25 * 60;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(pomoRef.current);
    }
    return () => clearInterval(pomoRef.current);
  }, [pomodoroActive]);

  const addWater = (ml) => {
    setWater((prev) => Math.min(prev + ml, 3000));
  };

  const resetWater = () => setWater(0);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#e8e8e8",
        fontFamily: "'Space Mono', monospace",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Orbitron:wght@700;900&display=swap"
        rel="stylesheet"
      />
      {isMobile && (
        <div
          style={{
            position: "fixed",
            top: 12,
            left: 12,
            zIndex: 200,
          }}
        >
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            style={{
              background: "#0f0f0f",
              border: "1px solid rgba(57,255,20,0.2)",
              borderRadius: 8,
              color: "#39ff14",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "1.2rem",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>
        </div>
      )}
      <Sidebar
        nav={nav}
        setNav={handleNav}
        name="Grinder"
        streak={streak}
        level={level}
        xp={xp}
        levelPct={levelPct}
        isMobile={isMobile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main
        style={{
          flex: 1,
          padding: isMobile ? "0.75rem" : "2rem",
          overflowY: "auto",
          paddingTop: isMobile ? 64 : "2rem",
          maxWidth: "100%",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={nav}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {nav === "dashboard" && (
              <Dashboard
                user={{ name: "Grinder" }}
                tasks={tasks}
                pctToday={pctToday}
                completedToday={completedToday}
                totalToday={totalToday}
                streak={streak}
                history={mergedHistory}
                level={level}
                xp={xp}
                earnedBadges={earnedBadges}
                water={water}
                addWater={addWater}
                resetWater={resetWater}
              />
            )}
            {nav === "tasks" && (
              <Tasks tasks={tasks} setTasks={setTasks} />
            )}
            {nav === "analytics" && (
              <Analytics history={mergedHistory} tasks={tasks} />
            )}
            {nav === "calendar" && (
              <CalendarView history={mergedHistory} pctToday={pctToday} />
            )}
            {nav === "pomodoro" && (
              <Pomodoro
                pomodoroTime={pomodoroTime}
                setPomodoroTime={setPomodoroTime}
                pomodoroActive={pomodoroActive}
                setPomodoroActive={setPomodoroActive}
                pomodoroMode={pomodoroMode}
                setPomodoroMode={setPomodoroMode}
              />
            )}
            {nav === "journal" && (
              <Journal journal={journal} setJournal={setJournal} />
            )}
            {nav === "calories" && (
              <CalorieTracker />
            )}
            {nav === "gym" && (
              <ProgressiveOverload />
            )}
            {nav === "badges" && (
              <BadgesPage earnedBadges={earnedBadges} stats={stats} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
