export default function PriorityDot({ p }) {
  const c =
    p === "high" ? "#ff453a" : p === "medium" ? "#ff9f0a" : "#30d0fe";
  return (
    <span
      title={p}
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: c,
        flexShrink: 0,
      }}
    />
  );
}
