import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { getDashboardAnalytics } from "@/api/analytics";
import { PeriodFilter } from "@/components/filters/period-filter";
import { FullscreenState } from "@/components/feedback/fullscreen-state";
import { BarChartCard } from "@/features/dashboard/components/bar-chart-card";
import { KpiCard } from "@/features/dashboard/components/kpi-card";
import { LineChartCard } from "@/features/dashboard/components/line-chart-card";
import { formatCompactNumber, formatCurrency, formatPercent } from "@/lib/formatters";
import { getPeriodFromSearchParams } from "@/lib/period";

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const period = getPeriodFromSearchParams(searchParams);

  const dashboardQuery = useQuery({
    queryKey: ["analytics-dashboard", period],
    queryFn: () => getDashboardAnalytics(period),
  });

  if (dashboardQuery.isLoading && !dashboardQuery.data) {
    return (
      <FullscreenState
        eyebrow="Dashboard"
        title="Carregando indicadores"
        description="Buscando KPIs, distribuicoes e receita fechada do periodo selecionado."
      />
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <FullscreenState
        eyebrow="Dashboard"
        title="Nao foi possivel carregar o dashboard"
        description="A camada analitica nao respondeu. Verifique a API e tente novamente."
      />
    );
  }

  const dashboard = dashboardQuery.data;

  return (
    <section className="stack">
      <article className="card card--hero">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">Dashboard</p>
            <h1>Pulso comercial da operacao</h1>
          </div>
          <span className="badge badge--muted">
            {dashboard.pipeline?.name ?? "Pipeline default"}
          </span>
        </div>
        <p className="section-copy">
          KPIs consolidados por periodo para acompanhar geracao de demanda, conversao e receita realizada.
        </p>
      </article>

      <PeriodFilter
        value={period}
        onApply={(next) => {
          const params = new URLSearchParams(searchParams);
          params.set("from", next.from);
          params.set("to", next.to);
          setSearchParams(params);
        }}
      />

      <div className="kpi-grid">
        <KpiCard
          eyebrow="Leads"
          label="Total no periodo"
          value={formatCompactNumber(dashboard.kpis.total_leads)}
          hint="Leads criados dentro da janela filtrada."
        />
        <KpiCard
          eyebrow="Deals"
          label="Oportunidades abertas"
          value={formatCompactNumber(dashboard.kpis.total_deals)}
          hint="Deals que entraram no periodo."
        />
        <KpiCard
          eyebrow="Conversao"
          label="Taxa de ganho"
          value={formatPercent(dashboard.kpis.conversion_rate)}
          hint={`${formatCompactNumber(dashboard.kpis.won_deals)} deals ganhos no periodo.`}
        />
        <KpiCard
          eyebrow="Pipe"
          label="Valor em negociacao"
          value={formatCurrency(dashboard.kpis.open_pipeline_value)}
          hint="Pipeline ainda aberto na carteira visivel."
        />
        <KpiCard
          eyebrow="Fechado"
          label="Receita ganha"
          value={formatCurrency(dashboard.kpis.closed_amount)}
          hint="Deals ganhos com fechamento dentro do periodo."
        />
        <KpiCard
          eyebrow="Ticket"
          label="Ticket medio"
          value={formatCurrency(dashboard.kpis.average_ticket)}
          hint="Media por deal fechado como ganho."
        />
      </div>

      <div className="analytics-grid">
        <BarChartCard
          eyebrow="Origem"
          title="Leads por origem"
          emptyLabel="Nenhuma origem registrou leads nesse recorte."
          items={dashboard.leads_by_source.map((item) => ({
            id: item.source_id ?? item.source_name ?? "sem-origem",
            label: item.source_name ?? "Sem origem",
            value: item.lead_count,
            meta: `${formatCompactNumber(item.lead_count)} leads`,
          }))}
        />
        <BarChartCard
          eyebrow="Etapas"
          title="Valor aberto por etapa"
          emptyLabel="Nao ha valor em aberto no pipeline filtrado."
          items={dashboard.deals_by_stage.map((item) => ({
            id: item.stage_id,
            label: item.stage_name,
            value: Number(item.total_amount),
            meta: `${formatCurrency(item.total_amount)} • ${formatCompactNumber(item.deal_count)} deals`,
            color: item.stage_color,
          }))}
        />
        <LineChartCard
          eyebrow="Receita"
          title="Fechamento ganho por periodo"
          emptyLabel="Nenhum fechamento ganho no periodo selecionado."
          points={dashboard.won_amount_by_period.map((item) => ({
            label: item.period,
            value: Number(item.amount),
          }))}
          valueLabel={(value) => formatCurrency(value)}
        />
      </div>
    </section>
  );
}
