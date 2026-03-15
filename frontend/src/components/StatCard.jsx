export default function StatCard({ label, value, sub, color = "default", icon, trend }) {
  const colorMap = {
    default: { val: "var(--text-1)",   bg: "var(--bg-2)",       border: "var(--border-1)" },
    green:   { val: "var(--green)",    bg: "var(--green-dim)",  border: "rgba(31,217,128,0.15)" },
    red:     { val: "var(--red)",      bg: "var(--red-dim)",    border: "rgba(255,77,109,0.15)" },
    blue:    { val: "var(--blue)",     bg: "var(--blue-dim)",   border: "rgba(77,158,255,0.15)" },
    amber:   { val: "var(--amber)",    bg: "var(--amber-dim)",  border: "rgba(255,184,48,0.15)" },
    violet:  { val: "var(--violet)",   bg: "var(--violet-dim)", border: "rgba(139,92,246,0.15)" },
  };

  const c = colorMap[color] || colorMap.default;

  return (
    <div style={{
      background: c.bg,
      border: `1.5px solid ${c.border}`,
      borderRadius: "var(--r-lg)",
      padding: "20px 22px",
      display: "flex", flexDirection: "column", gap: "4px",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
    className="card-hover"
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-3)" }}>
          {label}
        </span>
        {icon && <span style={{ fontSize: "16px", opacity: 0.6 }}>{icon}</span>}
      </div>
      <div className="mono" style={{ fontSize: "26px", fontWeight: 700, color: c.val, letterSpacing: "-0.03em" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "4px" }}>{sub}</div>}
      {trend !== undefined && (
        <div style={{
          fontSize: "12px",
          color: trend >= 0 ? "var(--green)" : "var(--red)",
          marginTop: "6px", fontWeight: 600
        }}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  );
}