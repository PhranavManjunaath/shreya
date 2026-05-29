import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase.js";

const TABLE_MAP = {
  tasks: "tasks",
  history: "history",
  journal: "journal",
  water: "water_log",
  workout_days: "workout_days",
  workout_logs: "workout_logs",
  calorie_logs: "calorie_logs",

};

const K = (key) => `gt_${key}`;

const loadLocal = (key, fallback) => {
  try {
    const raw = localStorage.getItem(K(key));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveLocal = (key, data) => {
  try {
    localStorage.setItem(K(key), JSON.stringify(data));
  } catch {}
};

async function loadFromSupabase(table, userId) {
  if (table === "water_log") {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from(table)
      .select("amount")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();
    return data?.amount ?? 0;
  }

  if (table === "calorie_logs") {
    const { data } = await supabase
      .from(table)
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    return data || [];
  }

  if (table === "workout_days") {
    const { data } = await supabase
      .from(table)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    return data || [];
  }

  if (table === "workout_logs") {
    const { data } = await supabase
      .from(table)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return data || [];
  }

  const { data } = await supabase
    .from(table)
    .select("*")
    .eq("user_id", userId);
  return data || [];
}

async function saveToSupabase(table, userId, data) {
  if (table === "water_log") {
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from(table).upsert(
      { user_id: userId, date: today, amount: data },
      { onConflict: "user_id, date" }
    );
    return;
  }

  if (table === "calorie_logs") {
    const entries = Array.isArray(data) ? data : [];
    for (const entry of entries) {
      await supabase.from(table).upsert(
        { user_id: userId, ...entry },
        { onConflict: "user_id, date" }
      );
    }
    return;
  }

  if (table === "workout_days" || table === "workout_logs") {
    const entries = Array.isArray(data) ? data : [];
    for (const entry of entries) {
      await supabase.from(table).upsert(
        { user_id: userId, ...entry },
        { onConflict: "id" }
      );
    }
    return;
  }

  if (Array.isArray(data)) {
    for (const entry of data) {
      await supabase.from(table).upsert(
        { user_id: userId, ...entry },
        { onConflict: "id" }
      );
    }
  }
}

function migrateIfNeeded(key, userId) {
  const migrated = loadLocal("_migrated", {});
  if (migrated[key]) return;

  const localData = loadLocal(key, null);
  if (localData !== null) {
    const table = TABLE_MAP[key];
    if (table) {
      saveToSupabase(table, userId, localData);
    }
  }

  migrated[key] = true;
  saveLocal("_migrated", migrated);
}

export function useSyncData(key, defaultValue) {
  const [data, setData] = useState(() => loadLocal(key, defaultValue));
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (session?.user) {
      const table = TABLE_MAP[key];
      if (table) {
        migrateIfNeeded(key, session.user.id);
        loadFromSupabase(table, session.user.id).then((remote) => {
          if (remote && remote.length !== 0) {
            setData(remote);
            saveLocal(key, remote);
          }
        });
      }
    }
  }, [session, ready, key]);

  const setAndSave = useCallback(
    (next) => {
      const resolved = typeof next === "function" ? next(data) : next;
      setData(resolved);
      saveLocal(key, resolved);

      if (session?.user) {
        const table = TABLE_MAP[key];
        if (table) {
          saveToSupabase(table, session.user.id, resolved);
        }
      }
    },
    [data, key, session]
  );

  return [data, setAndSave];
}
