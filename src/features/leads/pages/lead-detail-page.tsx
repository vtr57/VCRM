import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { getLeadById, getLeadTimeline } from "@/api/leads";
import { FullscreenState } from "@/components/feedback/fullscreen-state";
import { InteractionComposer } from "@/features/interactions/components/interaction-composer";
import { InteractionTimeline } from "@/features/interactions/components/interaction-timeline";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatters";

const statusLabels = {
  new: "Novo",
  contacted: "Contatado",
  qualified: "Qualificado",
  proposal: "Proposta",
  won: "Ganho",
  lost: "Perdido",
};

const temperatureLabels = {
  cold: "Frio",
  warm: "Morno",
  hot: "Quente",
};

export function LeadDetailPage() {
  const { leadId } = useParams<{ leadId: string }>();

  const leadQuery = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => getLeadById(leadId as string),
    enabled: Boolean(leadId),
  });

  const timelineQuery = useQuery({
    queryKey: ["lead-timeline", leadId],
    queryFn: () => getLeadTimeline(leadId as string),
    enabled: Boolean(leadId),
  });

  if (!leadId) {
    return (
      <FullscreenState
        eyebrow="Leads"
        title="Lead nao encontrado"
        description="O identificador do lead nao foi enviado pela rota."
      />
    );
  }

  if (leadQuery.isLoading) {
    return (
      <FullscreenState
        eyebrow="Leads"
        title="Carregando lead"
        description="Buscando dados consolidados da conta e timeline operacional."
      />
    );
  }

  if (leadQuery.isError || !leadQuery.data) {
    return (
      <FullscreenState
        eyebrow="Leads"
        title="Nao foi possivel carregar o lead"
        description="Revise sua sessao ou tente novamente em instantes."
      />
    );
  }

  const lead = leadQuery.data;
  const timeline = timelineQuery.data?.results ?? [];

  return (
    <section className="stack">
      <article className="card card--hero">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">Lead detail</p>
            <h1>{lead.full_name}</h1>
          </div>
          <Link className="ghost-button" to="/leads">
            Voltar para lista
          </Link>
        </div>
        <p className="section-copy">
          {lead.company_name || "Empresa nao informada"}{lead.job_title ? ` • ${lead.job_title}` : ""}
        </p>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-card__label">Status</span>
            <strong>{statusLabels[lead.status]}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Temperatura</span>
            <strong>{temperatureLabels[lead.temperature]}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Valor estimado</span>
            <strong>{formatCurrency(lead.estimated_value)}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Proximo passo</span>
            <strong>{formatDate(lead.next_action_at)}</strong>
          </div>
        </div>
      </article>

      <div className="detail-grid">
        <article className="card">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">Contexto</p>
              <h2>Ficha comercial</h2>
            </div>
          </div>
          <dl className="detail-list">
            <div>
              <dt>Email</dt>
              <dd>{lead.email || "Nao informado"}</dd>
            </div>
            <div>
              <dt>Telefone</dt>
              <dd>{lead.phone || "Nao informado"}</dd>
            </div>
            <div>
              <dt>Origem</dt>
              <dd>{lead.source?.name || "Nao informada"}</dd>
            </div>
            <div>
              <dt>Responsavel</dt>
              <dd>{lead.assigned_to?.full_name || lead.created_by.full_name || "Sem owner"}</dd>
            </div>
            <div>
              <dt>Ultima interacao</dt>
              <dd>{formatDateTime(lead.last_interaction_at)}</dd>
            </div>
            <div>
              <dt>Criado em</dt>
              <dd>{formatDateTime(lead.created_at)}</dd>
            </div>
          </dl>
          <div className="stack stack--sm">
            <span className="form-label">Tags</span>
            <div className="chip-list">
              {lead.tags.length === 0 ? (
                <span className="badge badge--muted">Sem tags</span>
              ) : (
                lead.tags.map((tag) => (
                  <span className="badge badge--tag" key={tag.id}>
                    <span className="badge__swatch" style={{ backgroundColor: tag.color }} aria-hidden="true" />
                    {tag.name}
                  </span>
                ))
              )}
            </div>
          </div>
          {lead.notes_summary ? (
            <div className="note-block">
              <span className="form-label">Resumo</span>
              <p>{lead.notes_summary}</p>
            </div>
          ) : null}
        </article>

        <div className="stack">
          <InteractionComposer
            leadId={lead.id}
            timelineQueryKey={["lead-timeline", lead.id]}
            extraInvalidateKeys={[["pipeline-board"]]}
          />
          <InteractionTimeline
            interactions={timeline}
            emptyDescription="Ainda nao ha registro operacional para este lead. Comece pela ultima conversa ou por uma observacao interna."
          />
        </div>
      </div>
    </section>
  );
}
