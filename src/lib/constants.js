export const QUOTES = [
  "Discipline beats motivation.",
  "The grind never sleeps.",
  "Progress, not perfection.",
  "Champions are made in the off-season.",
  "Your future self is watching.",
];

export const BADGES = [
  { id: "streak7", label: "7-Day Streak", icon: "🔥", req: (s) => s.streak >= 7 },
  { id: "workouts30", label: "30 Workouts", icon: "💪", req: (s) => s.totalGym >= 30 },
  { id: "deepwork", label: "Deep Work", icon: "🧠", req: (s) => s.totalWork >= 20 },
  { id: "hydrated", label: "Hydration Hero", icon: "💧", req: (s) => s.water >= 200 },
  { id: "consistent", label: "Iron Consistent", icon: "⚡", req: (s) => s.streak >= 14 },
  { id: "centurion", label: "Centurion", icon: "🏆", req: (s) => s.xp >= 1000 },
];

export const SECTIONS = [
  { id: "gym", label: "💪 Gym", color: "#ff9f0a" },
  { id: "work", label: "💼 Work / Study", color: "#bf5af2" },
  { id: "habits", label: "🌿 Habits", color: "#39ff14" },
];

export const NAV_ITEMS = [
  { id: "dashboard", icon: "⚡", label: "Dashboard" },
  { id: "tasks", icon: "✓", label: "Tasks" },
  { id: "analytics", icon: "◈", label: "Analytics" },
  { id: "calendar", icon: "▦", label: "Calendar" },

  { id: "journal", icon: "✍", label: "Journal" },
  { id: "calories", icon: "🍽", label: "Calories" },
  { id: "gym", icon: "💪", label: "Gym Log" },
  { id: "badges", icon: "★", label: "Badges" },
];
