export default function GlassCard({ children, style = {} }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        padding: "1.25rem",
        backdropFilter: "blur(8px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
