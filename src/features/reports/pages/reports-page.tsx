import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import {
  getOwnerConversionReport,
  getSourceProfitabilityReport,
  getStageConversionReport,
} from "@/api/analytics";
import { PeriodFilter } from "@/components/filters/period-filter";
import { FullscreenState } from "@/components/feedback/fullscreen-state";
import { AnalyticsTable } from "@/features/reports/components/analytics-table";
import {
  ownerReportColumns,
  sourceReportColumns,
  stageReportColumns,
} from "@/features/reports/report-definitions";
import { getPeriodFromSearchParams } from "@/lib/period";

export function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const period = getPeriodFromSearchParams(searchParams);

  const stageReportQuery = useQuery({
    queryKey: ["report-stage-conversion", period],
    queryFn: () => getStageConversionReport(period),
  });

  const ownerReportQuery = useQuery({
    queryKey: ["report-owner-conversion", period],
    queryFn: () => getOwnerConversionReport(period),
  });

  const sourceReportQuery = useQuery({
    queryKey: ["report-source-profitability", period],
    queryFn: () => getSourceProfitabilityReport(period),
  });

  if (
    stageReportQuery.isLoading &&
    ownerReportQuery.isLoading &&
    sourceReportQuery.isLoading &&
    !stageReportQuery.data &&
    !ownerReportQuery.data &&
    !sourceReportQuery.data
  ) {
    return (
      <FullscreenState
        eyebrow="Relatorios"
        title="Carregando relatorios"
        description="Consolidando conversao por etapa, vendedor e origem para o periodo filtrado."
      />
    );
  }

  if (
    (stageReportQuery.isError && !stageReportQuery.data) ||
    (ownerReportQuery.isError && !ownerReportQuery.data) ||
    (sourceReportQuery.isError && !sourceReportQuery.data)
  ) {
    return (
      <FullscreenState
        eyebrow="Relatorios"
        title="Nao foi possivel carregar os relatorios"
        description="Um ou mais endpoints analiticos falharam. Verifique a API antes de exportar ou compartilhar dados."
      />
    );
  }

  return (
    <section className="stack">
      <article className="card card--hero">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">Relatorios</p>
            <h1>Comparativos prontos para gestao</h1>
          </div>
          <span className="badge badge--muted">Exportavel em breve</span>
        </div>
        <p className="section-copy">
          As tabelas abaixo ja usam definicoes de colunas e mapeamento de linhas reaproveitaveis, abrindo caminho para CSV e compartilhamento por email.
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

      <AnalyticsTable
        title="Conversao por etapa"
        eyebrow="Pipeline"
        rows={stageReportQuery.data?.results ?? []}
        columns={stageReportColumns}
        emptyLabel="Sem movimentacoes suficientes para calcular conversao por etapa."
        exportHint="A definicao de colunas ja esta desacoplada, o que permite adicionar exportacao CSV/PDF sem reescrever a tabela."
      />

      <AnalyticsTable
        title="Conversao por vendedor"
        eyebrow="Owners"
        rows={ownerReportQuery.data?.results ?? []}
        columns={ownerReportColumns}
        emptyLabel="Nenhum owner teve deals no periodo filtrado."
        exportHint="Os dados ja chegam agregados por owner, prontos para futuro download ou envio recorrente."
      />

      <AnalyticsTable
        title="Origem mais lucrativa"
        eyebrow="Origem"
        rows={sourceReportQuery.data?.results ?? []}
        columns={sourceReportColumns}
        emptyLabel="Nenhuma origem gerou deals no periodo selecionado."
        exportHint="A tabela esta preparada para exportacao futura, mantendo headers e valores normalizados por coluna."
      />
    </section>
  );
}
