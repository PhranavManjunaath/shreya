export default function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: "0.65rem",
        color: "#555",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        marginBottom: "0.75rem",
      }}
    >
      {children}
    </div>
  );
}
