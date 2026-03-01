interface BarChartItem {
  id: string;
  label: string;
  value: number;
  meta?: string;
  color?: string;
}

interface BarChartCardProps {
  eyebrow: string;
  title: string;
  items: BarChartItem[];
  emptyLabel: string;
}

export function BarChartCard({ eyebrow, title, items, emptyLabel }: BarChartCardProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 0);

  return (
    <article className="card">
      <p className="section-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {items.length === 0 ? (
        <div className="empty-state empty-state--inline">
          <strong>{emptyLabel}</strong>
        </div>
      ) : (
        <div className="chart-list">
          {items.map((item) => (
            <div className="chart-list__row" key={item.id}>
              <div className="chart-list__header">
                <strong>{item.label}</strong>
                <span>{item.meta}</span>
              </div>
              <div className="chart-list__track">
                <div
                  className="chart-list__fill"
                  style={{
                    width: `${maxValue === 0 ? 0 : (item.value / maxValue) * 100}%`,
                    background: item.color ?? "var(--accent)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
