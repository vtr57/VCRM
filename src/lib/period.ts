export interface PeriodFilterValue {
  from: string;
  to: string;
}

function formatInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function subtractDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - days);
  return copy;
}

export function getCurrentMonthPeriod(): PeriodFilterValue {
  const today = new Date();
  return {
    from: formatInputDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    to: formatInputDate(today),
  };
}

export function getRollingPeriod(days: number): PeriodFilterValue {
  const today = new Date();
  return {
    from: formatInputDate(subtractDays(today, days - 1)),
    to: formatInputDate(today),
  };
}

export function getPeriodFromSearchParams(searchParams: URLSearchParams): PeriodFilterValue {
  const defaults = getCurrentMonthPeriod();
  return {
    from: searchParams.get("from") ?? defaults.from,
    to: searchParams.get("to") ?? defaults.to,
  };
}
