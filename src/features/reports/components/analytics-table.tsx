import type { ReactNode } from "react";

export interface AnalyticsColumn<Row> {
  key: string;
  header: string;
  render: (row: Row) => ReactNode;
  exportValue?: (row: Row) => string | number;
}

interface AnalyticsTableProps<Row> {
  title: string;
  eyebrow: string;
  rows: Row[];
  columns: AnalyticsColumn<Row>[];
  emptyLabel: string;
  exportHint: string;
}

export function AnalyticsTable<Row>({
  title,
  eyebrow,
  rows,
  columns,
  emptyLabel,
  exportHint,
}: AnalyticsTableProps<Row>) {
  return (
    <article className="card">
      <div className="section-heading">
        <div>
          <p className="section-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <button className="ghost-button" disabled type="button">
          Exportar CSV em breve
        </button>
      </div>
      <p className="section-copy">{exportHint}</p>
      {rows.length === 0 ? (
        <div className="empty-state empty-state--inline">
          <strong>{emptyLabel}</strong>
        </div>
      ) : (
        <div className="data-table__wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column.key}>{column.render(row)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
