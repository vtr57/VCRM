import { formatDateTime } from "@/lib/formatters";
import type { Interaction } from "@/types/interactions";

interface InteractionTimelineProps {
  interactions: Interaction[];
  title?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

const interactionLabels: Record<Interaction["type"], string> = {
  call: "Ligacao",
  message: "Mensagem",
  email: "Email",
  meeting: "Reuniao",
  note: "Observacao",
};

const directionLabels: Record<Interaction["direction"], string> = {
  inbound: "Entrada",
  outbound: "Saida",
  internal: "Interna",
};

export function InteractionTimeline({
  interactions,
  title = "Timeline de interacoes",
  emptyTitle = "Sem interacoes registradas",
  emptyDescription = "Registre a primeira ligacao, mensagem ou observacao para destravar o historico comercial.",
}: InteractionTimelineProps) {
  return (
    <article className="card">
      <div className="section-heading">
        <div>
          <p className="section-eyebrow">Interacoes</p>
          <h2>{title}</h2>
        </div>
        <span className="badge badge--muted">{interactions.length} registros</span>
      </div>
      {interactions.length === 0 ? (
        <div className="empty-state empty-state--inline">
          <strong>{emptyTitle}</strong>
          <p>{emptyDescription}</p>
        </div>
      ) : (
        <ol className="timeline">
          {interactions.map((interaction) => (
            <li className="timeline__item" key={interaction.id}>
              <div className="timeline__dot" aria-hidden="true" />
              <div className="timeline__content">
                <div className="timeline__header">
                  <div>
                    <strong>{interaction.subject || interactionLabels[interaction.type]}</strong>
                    <div className="timeline__meta">
                      <span className="badge badge--accent">{interactionLabels[interaction.type]}</span>
                      <span className="badge badge--muted">
                        {directionLabels[interaction.direction]}
                      </span>
                      <span>{interaction.created_by.full_name || interaction.created_by.email}</span>
                    </div>
                  </div>
                  <time dateTime={interaction.occurred_at}>{formatDateTime(interaction.occurred_at)}</time>
                </div>
                <p>{interaction.content}</p>
                {interaction.outcome ? (
                  <p className="timeline__outcome">Resultado: {interaction.outcome}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
