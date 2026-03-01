import { formatCurrency } from "@/lib/formatters";
import type { BoardDeal, BoardStage } from "@/types/pipeline";

interface KanbanBoardProps {
  stages: BoardStage[];
  draggingItemId: string | null;
  onDealDragStart: (deal: BoardDeal, stageId: string) => void;
  onDealDragEnd: () => void;
  onStageDrop: (stage: BoardStage) => void;
  onSelectDeal: (dealId: string) => void;
  selectedDealId: string | null;
}

export function KanbanBoard({
  stages,
  draggingItemId,
  onDealDragStart,
  onDealDragEnd,
  onStageDrop,
  onSelectDeal,
  selectedDealId,
}: KanbanBoardProps) {
  return (
    <div className="kanban-board">
      {stages.map((stage) => (
        <section
          className={`kanban-column ${draggingItemId ? "is-drop-enabled" : ""}`}
          key={stage.id}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => onStageDrop(stage)}
        >
          <header className="kanban-column__header">
            <div>
              <h2>{stage.name}</h2>
              <p>{stage.probability}% de probabilidade</p>
            </div>
            <span className="badge badge--muted">{stage.deals.length}</span>
          </header>
          <div className="kanban-column__body">
            {stage.deals.length === 0 ? (
              <div className="kanban-empty">
                <strong>Solte um card aqui</strong>
                <p>Use o quadro para atualizar o funil sem sair da operacao.</p>
              </div>
            ) : (
              stage.deals.map((deal) => (
                <article
                  key={deal.id}
                  className={`deal-card ${selectedDealId === deal.id ? "is-selected" : ""}`}
                  draggable
                  onClick={() => onSelectDeal(deal.id)}
                  onDragEnd={onDealDragEnd}
                  onDragStart={() => onDealDragStart(deal, stage.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectDeal(deal.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="deal-card__meta card-meta-row">
                    <span aria-label="Nome" className="card-meta-icon" role="img" title="Nome">
                      <i aria-hidden="true" className="fa-solid fa-user" />
                    </span>
                    <strong>{deal.lead.full_name}</strong>
                  </div>
                  <div className="deal-card__meta card-meta-row">
                    <span aria-label="Empresa" className="card-meta-icon" role="img" title="Empresa">
                      <i aria-hidden="true" className="fa-solid fa-building" />
                    </span>
                    <strong>{deal.lead.company_name || "Sem empresa"}</strong>
                  </div>
                  <div className="deal-card__meta card-meta-row">
                    <span aria-label="Contato" className="card-meta-icon" role="img" title="Contato">
                      <i aria-hidden="true" className="fa-solid fa-address-card" />
                    </span>
                    <strong>{deal.lead.phone || deal.lead.email || "Sem contato"}</strong>
                  </div>
                  <div className="deal-card__meta card-meta-row">
                    <span aria-label="Valor" className="card-meta-icon" role="img" title="Valor">
                      <i aria-hidden="true" className="fa-solid fa-sack-dollar" />
                    </span>
                    <strong>{formatCurrency(deal.amount)}</strong>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
