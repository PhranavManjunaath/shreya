import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./lib/supabase.js";
import { today } from "./lib/helpers.js";
import { BADGES } from "./lib/constants.js";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Tasks from "./components/Tasks.jsx";
import Analytics from "./components/Analytics.jsx";
import CalendarView from "./components/CalendarView.jsx";
import Pomodoro from "./components/Pomodoro.jsx";
import Journal from "./components/Journal.jsx";
import WeightTracker from "./components/WeightTracker.jsx";
import BadgesPage from "./components/BadgesPage.jsx";

export default function GrindTracker({ session }) {
  const user = session?.user;
  const userId = user?.id;

  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [journal, setJournal] = useState([]);
  const [water, setWater] = useState(0);
  const [weight, setWeight] = useState([]);
  const [nav, setNav] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroMode, setPomodoroMode] = useState("work");
  const pomoRef = useRef(null);
  const pomodoroModeRef = useRef("work");

  useEffect(() => {
    pomodoroModeRef.current = pomodoroMode;
  }, [pomodoroMode]);

  const initialLoad = useRef(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [tasksRes, historyRes, journalRes, waterRes, weightRes] =
        await Promise.all([
          supabase
            .from("tasks")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),
          supabase
            .from("history")
            .select("*")
            .eq("user_id", userId)
            .order("date", { ascending: true }),
          supabase
            .from("journal")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),
          supabase
            .from("water_log")
            .select("*")
            .eq("user_id", userId)
            .eq("date", today())
            .maybeSingle(),
          supabase
            .from("weight_log")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: true }),
        ]);

      if (tasksRes.data) setTasks(tasksRes.data);
      if (historyRes.data) setHistory(historyRes.data);
      if (journalRes.data) setJournal(journalRes.data);
      if (waterRes.data) setWater(waterRes.data.amount);
      if (weightRes.data) setWeight(weightRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      initialLoad.current = false;
      setLoading(false);
    }
  };

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

  const syncTasksRef = useRef(null);
  useEffect(() => {
    if (initialLoad.current) return;
    clearTimeout(syncTasksRef.current);
    syncTasksRef.current = setTimeout(async () => {
      const taskRows = tasks.map((t) => ({
        id: t.id,
        user_id: userId,
        section: t.section,
        text: t.text,
        done: t.done,
        priority: t.priority,
      }));
      const { error } = await supabase.from("tasks").upsert(taskRows, {
        onConflict: "id",
        ignoreDuplicates: false,
      });
      if (error) console.error("task sync error:", error);

      if (tasks.length > 0) {
        const { error: histErr } = await supabase
          .from("history")
          .upsert(
            { user_id: userId, ...todayHistory },
            { onConflict: "user_id,date", ignoreDuplicates: false }
          );
        if (histErr) console.error("history sync error:", histErr);
      }
    }, 500);
  }, [tasks]);

  const syncJournalRef = useRef(null);
  useEffect(() => {
    if (initialLoad.current) return;
    clearTimeout(syncJournalRef.current);
    syncJournalRef.current = setTimeout(async () => {
      for (const entry of journal) {
        const { error } = await supabase.from("journal").upsert(
          {
            id: entry.id,
            user_id: userId,
            date: entry.date,
            text: entry.text,
          },
          { onConflict: "id" }
        );
        if (error) console.error("journal sync error:", error);
      }
    }, 500);
  }, [journal]);

  const syncWeightRef = useRef(null);
  useEffect(() => {
    if (initialLoad.current) return;
    clearTimeout(syncWeightRef.current);
    syncWeightRef.current = setTimeout(async () => {
      for (const entry of weight) {
        const { error } = await supabase.from("weight_log").upsert(
          { id: entry.id, user_id: userId, date: entry.date, kg: entry.kg },
          { onConflict: "id" }
        );
        if (error) console.error("weight sync error:", error);
      }
    }, 500);
  }, [weight]);

  const addWater = (ml) => {
    setWater((prev) => {
      const next = Math.min(prev + ml, 3000);
      upsertWater(next);
      return next;
    });
  };

  const resetWater = () => {
    setWater(0);
    upsertWater(0);
  };

  const upsertWater = async (amount) => {
    const { error } = await supabase
      .from("water_log")
      .upsert(
        { user_id: userId, date: today(), amount },
        { onConflict: "user_id,date" }
      );
    if (error) console.error("water sync error:", error);
  };

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

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div
      style={{
        display: "flex",
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
      <Sidebar
        nav={nav}
        setNav={setNav}
        name={user?.user_metadata?.name || user?.email?.split("@")[0] || "Grinder"}
        streak={streak}
        level={level}
        xp={xp}
        levelPct={levelPct}
        onLogout={() => supabase.auth.signOut()}
      />
      <main
        style={{
          flex: 1,
          padding: "2rem",
          overflowY: "auto",
          maxWidth: "calc(100% - 260px)",
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
                user={{
                  name:
                    user?.user_metadata?.name ||
                    user?.email?.split("@")[0] ||
                    "Grinder",
                }}
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
            {nav === "weight" && (
              <WeightTracker weight={weight} setWeight={setWeight} />
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

function LoadingScreen() {
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
