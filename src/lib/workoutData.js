export const calcVolume = (sets) =>
  sets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);

export const estimate1RM = (weight, reps) => {
  if (!weight || !reps) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
};

export const detectPR = (entry, exerciseHistory) => {
  if (!exerciseHistory || exerciseHistory.length === 0) return null;

  const prevBestWeight = Math.max(...exerciseHistory.map((e) => Math.max(...e.sets.map((s) => s.weight || 0))));
  const prevBestVolume = Math.max(...exerciseHistory.map((e) => calcVolume(e.sets)));
  const currVolume = calcVolume(entry.sets);
  const currMaxWeight = Math.max(...entry.sets.map((s) => s.weight || 0));

  const prs = [];
  if (currMaxWeight > prevBestWeight) prs.push({ type: "weight", label: "New Weight PR", value: `${currMaxWeight}kg` });
  if (currVolume > prevBestVolume) prs.push({ type: "volume", label: "New Volume PR", value: `${currVolume}kg` });

  return prs.length ? prs : null;
};

export const getProgress = (entry, prevEntry) => {
  if (!prevEntry) return { status: "baseline", pct: 0, label: "First session — baseline set" };

  const currVol = calcVolume(entry.sets);
  const prevVol = calcVolume(prevEntry.sets);
  const pct = prevVol > 0 ? Math.round(((currVol - prevVol) / prevVol) * 100) : 0;

  if (pct > 2) return { status: "up", pct, label: `⬆ Progressive Overload Achieved (+${pct}%)` };
  if (pct >= -2) return { status: "same", pct, label: "🟡 Maintained" };
  return { status: "down", pct, label: `🔴 Decline (${pct}%)` };
};

export const getWeeklyStrengthScore = (logs) => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekLogs = logs.filter((l) => new Date(l.date) >= weekStart);
  if (weekLogs.length < 2) return null;

  const exercises = {};
  weekLogs.forEach((l) => {
    if (!exercises[l.exercise]) exercises[l.exercise] = [];
    exercises[l.exercise].push(l);
  });

  let totalPct = 0;
  let count = 0;
  Object.values(exercises).forEach((exLogs) => {
    const sorted = exLogs.sort((a, b) => new Date(a.date) - new Date(b.date));
    for (let i = 1; i < sorted.length; i++) {
      const prevVol = calcVolume(sorted[i - 1].sets);
      const currVol = calcVolume(sorted[i].sets);
      if (prevVol > 0) {
        totalPct += (currVol - prevVol) / prevVol;
        count++;
      }
    }
  });

  return count > 0 ? Math.round((totalPct / count) * 100) : 0;
};

export const getMonthlyProgress = (logs) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthLogs = logs.filter((l) => new Date(l.date) >= monthStart);
  if (monthLogs.length === 0) return null;

  const first = monthLogs[0];
  const last = monthLogs[monthLogs.length - 1];
  const firstVol = calcVolume(first.sets);
  const lastVol = calcVolume(last.sets);

  if (firstVol === 0) return null;
  return Math.round(((lastVol - firstVol) / firstVol) * 100);
};

export const getPRCountThisMonth = (logs) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let count = 0;
  const byExercise = {};
  const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));

  sorted.forEach((l) => {
    if (!byExercise[l.exercise]) byExercise[l.exercise] = [];
    const prev = byExercise[l.exercise];
    const prs = detectPR(l, prev);
    if (prs && new Date(l.date) >= monthStart) count += prs.length;
    byExercise[l.exercise].push(l);
  });

  return count;
};
