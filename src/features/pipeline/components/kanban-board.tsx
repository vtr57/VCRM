import { useEffect, useEffectEvent, useRef } from "react";

import { BuildingIcon, ContactCardIcon, MoneyBagIcon, TrashIcon, UserIcon } from "@/components/icons/app-icons";
import { formatCurrency } from "@/lib/formatters";
import type { BoardDeal, BoardStage } from "@/types/pipeline";

const AUTO_SCROLL_EDGE_THRESHOLD = 96;
const AUTO_SCROLL_MIN_SPEED = 10;
const AUTO_SCROLL_MAX_SPEED = 22;

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
  const boardRef = useRef<HTMLDivElement | null>(null);
  const autoScrollRef = useRef<{ direction: -1 | 0 | 1; frameId: number | null; speed: number }>({
    direction: 0,
    frameId: null,
    speed: 0,
  });

  const stopAutoScroll = useEffectEvent(() => {
    if (autoScrollRef.current.frameId !== null) {
      window.cancelAnimationFrame(autoScrollRef.current.frameId);
    }

    autoScrollRef.current.direction = 0;
    autoScrollRef.current.frameId = null;
    autoScrollRef.current.speed = 0;
  });

  const startAutoScroll = useEffectEvent((direction: -1 | 1, speed: number) => {
    autoScrollRef.current.direction = direction;
    autoScrollRef.current.speed = speed;

    if (autoScrollRef.current.frameId !== null) {
      return;
    }

    const step = () => {
      const board = boardRef.current;
      if (!board || autoScrollRef.current.direction === 0) {
        autoScrollRef.current.frameId = null;
        return;
      }

      const maxScrollLeft = Math.max(board.scrollWidth - board.clientWidth, 0);
      const nextScrollLeft = Math.min(
        Math.max(board.scrollLeft + autoScrollRef.current.direction * autoScrollRef.current.speed, 0),
        maxScrollLeft,
      );

      if (nextScrollLeft === board.scrollLeft) {
        stopAutoScroll();
        return;
      }

      board.scrollLeft = nextScrollLeft;
      autoScrollRef.current.frameId = window.requestAnimationFrame(step);
    };

    autoScrollRef.current.frameId = window.requestAnimationFrame(step);
  });

  const handleBoardDragOver = useEffectEvent((event: React.DragEvent<HTMLDivElement>) => {
    if (!draggingItemId) {
      stopAutoScroll();
      return;
    }

    event.preventDefault();

    const board = boardRef.current;
    if (!board) {
      stopAutoScroll();
      return;
    }

    const rect = board.getBoundingClientRect();
    const threshold = Math.min(AUTO_SCROLL_EDGE_THRESHOLD, rect.width / 3);
    if (threshold <= 0) {
      stopAutoScroll();
      return;
    }

    const leftDistance = event.clientX - rect.left;
    const rightDistance = rect.right - event.clientX;
    const maxScrollLeft = Math.max(board.scrollWidth - board.clientWidth, 0);

    if (leftDistance <= threshold && board.scrollLeft > 0) {
      const intensity = (threshold - Math.max(leftDistance, 0)) / threshold;
      const speed = AUTO_SCROLL_MIN_SPEED + intensity * (AUTO_SCROLL_MAX_SPEED - AUTO_SCROLL_MIN_SPEED);
      startAutoScroll(-1, speed);
      return;
    }

    if (rightDistance <= threshold && board.scrollLeft < maxScrollLeft) {
      const intensity = (threshold - Math.max(rightDistance, 0)) / threshold;
      const speed = AUTO_SCROLL_MIN_SPEED + intensity * (AUTO_SCROLL_MAX_SPEED - AUTO_SCROLL_MIN_SPEED);
      startAutoScroll(1, speed);
      return;
    }

    stopAutoScroll();
  });

  useEffect(() => {
    if (!draggingItemId) {
      stopAutoScroll();
    }
  }, [draggingItemId]);

  useEffect(() => {
    const handleDragFinish = () => {
      stopAutoScroll();
    };

    window.addEventListener("dragend", handleDragFinish);
    window.addEventListener("drop", handleDragFinish);

    return () => {
      window.removeEventListener("dragend", handleDragFinish);
      window.removeEventListener("drop", handleDragFinish);
      stopAutoScroll();
    };
  }, []);

  return (
    <div className="kanban-board" ref={boardRef} onDragOver={handleBoardDragOver} onDrop={() => stopAutoScroll()}>
      {stages.map((stage) => {
        const totalAmount = stage.deals.reduce((sum, deal) => sum + Number(deal.amount || 0), 0);

        return (
          <section
            className={`kanban-column kanban-column--${stage.kind} ${draggingItemId ? "is-drop-enabled" : ""}`}
            key={stage.id}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => onStageDrop(stage)}
          >
            <header className="kanban-column__header">
              <div>
                <h2 className="kanban-column__title">
                  <span>{stage.name}</span>
                  <span className="kanban-column__total">{formatCurrency(totalAmount)}</span>
                </h2>
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
                    className={`deal-card deal-card--${stage.kind} ${selectedDealId === deal.id ? "is-selected" : ""}`}
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
        );
      })}
    </div>
  );
}
