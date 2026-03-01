import { formatDate } from "@/lib/formatters";

interface LineChartPoint {
  label: string;
  value: number;
}

interface LineChartCardProps {
  eyebrow: string;
  title: string;
  points: LineChartPoint[];
  emptyLabel: string;
  valueLabel: (value: number) => string;
}

function buildPath(points: LineChartPoint[]) {
  if (points.length === 0) {
    return "";
  }

  const maxValue = Math.max(...points.map((point) => point.value), 0);
  const width = 100;
  const height = 100;

  return points
    .map((point, index) => {
      const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
      const y = maxValue === 0 ? height : height - (point.value / maxValue) * height;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export function LineChartCard({
  eyebrow,
  title,
  points,
  emptyLabel,
  valueLabel,
}: LineChartCardProps) {
  const path = buildPath(points);
  const latestPoint = points[points.length - 1];

  return (
    <article className="card">
      <p className="section-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {points.length === 0 ? (
        <div className="empty-state empty-state--inline">
          <strong>{emptyLabel}</strong>
        </div>
      ) : (
        <div className="line-chart">
          <svg className="line-chart__svg" viewBox="0 0 100 100" preserveAspectRatio="none" role="img">
            <path className="line-chart__grid" d="M 0 100 L 100 100" />
            <path className="line-chart__path" d={path} />
          </svg>
          <div className="line-chart__summary">
            <strong>{latestPoint ? valueLabel(latestPoint.value) : valueLabel(0)}</strong>
            <span>{latestPoint ? formatDate(latestPoint.label) : "Sem periodo"}</span>
          </div>
          <div className="line-chart__labels">
            <span>{formatDate(points[0].label)}</span>
            <span>{formatDate(points[points.length - 1].label)}</span>
          </div>
        </div>
      )}
    </article>
  );
}
