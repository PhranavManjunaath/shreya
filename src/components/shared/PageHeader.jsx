export default function PageHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <h2
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "1.4rem",
          color: "#fff",
          margin: 0,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            color: "#444",
            fontSize: "0.75rem",
            margin: "0.3rem 0 0",
            letterSpacing: "0.08em",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
