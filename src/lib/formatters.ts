export function formatCurrency(value: string | number | null | undefined) {
  const numericValue = typeof value === "number" ? value : Number(value ?? 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

export function formatPercent(value: number | string | null | undefined) {
  const numericValue = typeof value === "number" ? value : Number(value ?? 0);
  return `${new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Number.isFinite(numericValue) ? numericValue : 0)}%`;
}

export function formatCompactNumber(value: number | string | null | undefined) {
  const numericValue = typeof value === "number" ? value : Number(value ?? 0);
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Sem registro";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
  }).format(new Date(value));
}
