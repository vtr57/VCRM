import { formatCompactNumber, formatCurrency, formatPercent } from "@/lib/formatters";
import type {
  OwnerConversionResult,
  SourceProfitabilityResult,
  StageConversionResult,
} from "@/types/analytics";

import type { AnalyticsColumn } from "@/features/reports/components/analytics-table";

export const stageReportColumns: AnalyticsColumn<StageConversionResult>[] = [
  {
    key: "stage",
    header: "Etapa",
    render: (row) => (
      <div className="table-primary">
        <strong>{row.stage_name}</strong>
        <span>{row.stage_kind}</span>
      </div>
    ),
    exportValue: (row) => row.stage_name,
  },
  {
    key: "entered",
    header: "Entraram",
    render: (row) => formatCompactNumber(row.entered_deals),
    exportValue: (row) => row.entered_deals,
  },
  {
    key: "current",
    header: "Atuais",
    render: (row) => formatCompactNumber(row.current_deals),
    exportValue: (row) => row.current_deals,
  },
  {
    key: "won",
    header: "Ganhos",
    render: (row) => formatCompactNumber(row.won_deals),
    exportValue: (row) => row.won_deals,
  },
  {
    key: "conversion",
    header: "Conversao",
    render: (row) => formatPercent(row.conversion_rate),
    exportValue: (row) => row.conversion_rate,
  },
  {
    key: "amount",
    header: "Valor atual",
    render: (row) => formatCurrency(row.current_amount),
    exportValue: (row) => row.current_amount,
  },
];

export const ownerReportColumns: AnalyticsColumn<OwnerConversionResult>[] = [
  {
    key: "owner",
    header: "Vendedor",
    render: (row) => (
      <div className="table-primary">
        <strong>{row.owner_name}</strong>
        <span>{row.owner_email || "Sem email"}</span>
      </div>
    ),
    exportValue: (row) => row.owner_name,
  },
  {
    key: "total",
    header: "Deals",
    render: (row) => formatCompactNumber(row.total_deals),
    exportValue: (row) => row.total_deals,
  },
  {
    key: "open",
    header: "Abertos",
    render: (row) => formatCompactNumber(row.open_deals),
    exportValue: (row) => row.open_deals,
  },
  {
    key: "won",
    header: "Ganhos",
    render: (row) => formatCompactNumber(row.won_deals),
    exportValue: (row) => row.won_deals,
  },
  {
    key: "lost",
    header: "Perdidos",
    render: (row) => formatCompactNumber(row.lost_deals),
    exportValue: (row) => row.lost_deals,
  },
  {
    key: "conversion",
    header: "Conversao",
    render: (row) => formatPercent(row.conversion_rate),
    exportValue: (row) => row.conversion_rate,
  },
  {
    key: "won_amount",
    header: "Receita ganha",
    render: (row) => formatCurrency(row.won_amount),
    exportValue: (row) => row.won_amount,
  },
];

export const sourceReportColumns: AnalyticsColumn<SourceProfitabilityResult>[] = [
  {
    key: "source",
    header: "Origem",
    render: (row) => row.source_name,
    exportValue: (row) => row.source_name,
  },
  {
    key: "leads",
    header: "Leads",
    render: (row) => formatCompactNumber(row.total_leads),
    exportValue: (row) => row.total_leads,
  },
  {
    key: "deals",
    header: "Deals",
    render: (row) => formatCompactNumber(row.total_deals),
    exportValue: (row) => row.total_deals,
  },
  {
    key: "won",
    header: "Ganhos",
    render: (row) => formatCompactNumber(row.won_deals),
    exportValue: (row) => row.won_deals,
  },
  {
    key: "conversion",
    header: "Conversao",
    render: (row) => formatPercent(row.conversion_rate),
    exportValue: (row) => row.conversion_rate,
  },
  {
    key: "won_amount",
    header: "Receita ganha",
    render: (row) => formatCurrency(row.won_amount),
    exportValue: (row) => row.won_amount,
  },
  {
    key: "open_amount",
    header: "Pipe aberto",
    render: (row) => formatCurrency(row.open_amount),
    exportValue: (row) => row.open_amount,
  },
];
