export const uid = () => crypto.randomUUID();

export const today = () => new Date().toISOString().slice(0, 10);

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening";
};
