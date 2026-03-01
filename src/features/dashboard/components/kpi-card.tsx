interface KpiCardProps {
  eyebrow: string;
  label: string;
  value: string;
  hint?: string;
}

export function KpiCard({ eyebrow, label, value, hint }: KpiCardProps) {
  return (
    <article className="card kpi-card">
      <p className="section-eyebrow">{eyebrow}</p>
      <h2>{label}</h2>
      <p className="metric">{value}</p>
      {hint ? <p className="section-copy">{hint}</p> : null}
    </article>
  );
}
