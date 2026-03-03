import { BuildingIcon, ContactCardIcon, MoneyBagIcon, TrashIcon, UserIcon } from "@/components/icons/app-icons";
import { formatCurrency } from "@/lib/formatters";
import type { BoardDeal, BoardStage } from "@/types/pipeline";

interface KanbanBoardProps {
  deletingDealId: string | null;
  stages: BoardStage[];
  draggingItemId: string | null;
  onDeleteDeal: (deal: BoardDeal) => void;
  onDealDragStart: (deal: BoardDeal, stageId: string) => void;
  onDealDragEnd: () => void;
  onStageDrop: (stage: BoardStage) => void;
  onSelectDeal: (dealId: string) => void;
  selectedDealId: string | null;
}

export function KanbanBoard({
  deletingDealId,
  stages,
  draggingItemId,
  onDeleteDeal,
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
                  <button
                    aria-label={`Excluir deal de ${deal.lead.full_name}`}
                    className="deal-card__delete"
                    disabled={deletingDealId === deal.id}
                    draggable={false}
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onDeleteDeal(deal);
                    }}
                    onMouseDown={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <TrashIcon />
                  </button>
                  <div className="deal-card__meta card-meta-row">
                    <span aria-label="Nome" className="card-meta-icon" role="img" title="Nome">
                      <UserIcon />
                    </span>
                    <strong>{deal.lead.full_name}</strong>
                  </div>
                  <div className="deal-card__meta card-meta-row">
                    <span aria-label="Empresa" className="card-meta-icon" role="img" title="Empresa">
                      <BuildingIcon />
                    </span>
                    <strong>{deal.lead.company_name || "Sem empresa"}</strong>
                  </div>
                  <div className="deal-card__meta card-meta-row">
                    <span aria-label="Contato" className="card-meta-icon" role="img" title="Contato">
                      <ContactCardIcon />
                    </span>
                    <strong>{deal.lead.phone || deal.lead.email || "Sem contato"}</strong>
                  </div>
                  <div className="deal-card__meta card-meta-row">
                    <span aria-label="Valor" className="card-meta-icon" role="img" title="Valor">
                      <MoneyBagIcon />
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
