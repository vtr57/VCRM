import { useEffect, useState } from "react";

import { getCurrentMonthPeriod, getRollingPeriod, type PeriodFilterValue } from "@/lib/period";

interface PeriodFilterProps {
  value: PeriodFilterValue;
  onApply: (next: PeriodFilterValue) => void;
}

export function PeriodFilter({ value, onApply }: PeriodFilterProps) {
  const [draft, setDraft] = useState<PeriodFilterValue>(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <article className="card">
      <div className="section-heading">
        <div>
          <p className="section-eyebrow">Periodo</p>
          <h2>Filtro analitico</h2>
        </div>
        <div className="toolbar-actions">
          <button className="ghost-button" type="button" onClick={() => onApply(getCurrentMonthPeriod())}>
            Mes atual
          </button>
          <button className="ghost-button" type="button" onClick={() => onApply(getRollingPeriod(30))}>
            Ultimos 30 dias
          </button>
          <button className="ghost-button" type="button" onClick={() => onApply(getRollingPeriod(7))}>
            Ultimos 7 dias
          </button>
        </div>
      </div>
      <form
        className="toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          onApply(draft);
        }}
      >
        <label className="form-field">
          <span>De</span>
          <input
            type="date"
            value={draft.from}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                from: event.target.value,
              }))
            }
          />
        </label>
        <label className="form-field">
          <span>Ate</span>
          <input
            type="date"
            value={draft.to}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                to: event.target.value,
              }))
            }
          />
        </label>
        <div className="toolbar__submit">
          <button className="primary-link" type="submit">
            Aplicar periodo
          </button>
        </div>
      </form>
    </article>
  );
}
