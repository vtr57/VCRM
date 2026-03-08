import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KanbanBoard } from "@/features/pipeline/components/kanban-board";
import type { BoardStage } from "@/types/pipeline";

function buildStages(): BoardStage[] {
  return [
    {
      id: "stage-1",
      name: "Entrada",
      slug: "entrada",
      order: 0,
      color: "#960100",
      probability: 20,
      kind: "open",
      wip_limit: null,
      deals: [
        {
          id: "deal-1",
          title: "Deal 1",
          amount: "1200",
          status: "open",
          position: 0,
          expected_close_date: null,
          closed_at: null,
          lead: {
            id: "lead-1",
            full_name: "Maria Silva",
            company_name: "ACME",
            email: "maria@acme.com",
            phone: "11999999999",
            status: "qualified",
          },
          owner: null,
        },
      ],
    },
    {
      id: "stage-2",
      name: "Proposta",
      slug: "proposta",
      order: 1,
      color: "#960100",
      probability: 60,
      kind: "open",
      wip_limit: null,
      deals: [],
    },
  ];
}

describe("KanbanBoard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("auto-scrolls the board to the right while dragging near the visible edge", () => {
    let animationFrame: FrameRequestCallback | null = null;
    let scrollLeft = 120;

    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback: FrameRequestCallback) => {
      animationFrame = callback;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const { container } = render(
      <KanbanBoard
        deletingDealId={null}
        stages={buildStages()}
        draggingItemId="deal-1"
        onDeleteDeal={vi.fn()}
        onDealDragStart={vi.fn()}
        onDealDragEnd={vi.fn()}
        onStageDrop={vi.fn()}
        onSelectDeal={vi.fn()}
        selectedDealId={null}
      />,
    );

    const board = container.querySelector(".kanban-board");
    expect(board).not.toBeNull();

    const boardElement = board as HTMLDivElement;

    Object.defineProperty(boardElement, "clientWidth", { configurable: true, value: 320 });
    Object.defineProperty(boardElement, "scrollWidth", { configurable: true, value: 1280 });
    Object.defineProperty(boardElement, "scrollLeft", {
      configurable: true,
      get: () => scrollLeft,
      set: (value: number) => {
        scrollLeft = value;
      },
    });
    boardElement.getBoundingClientRect = () =>
      ({
        width: 400,
        height: 300,
        top: 0,
        right: 400,
        bottom: 300,
        left: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    fireEvent.dragOver(boardElement, { clientX: 390 });
    expect(animationFrame).not.toBeNull();

    if (!animationFrame) {
      throw new Error("Expected requestAnimationFrame to be scheduled.");
    }

    animationFrame(16);

    expect(scrollLeft).toBeGreaterThan(120);
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it("renders the deal cards", () => {
    render(
      <KanbanBoard
        deletingDealId={null}
        stages={buildStages()}
        draggingItemId={null}
        onDeleteDeal={vi.fn()}
        onDealDragStart={vi.fn()}
        onDealDragEnd={vi.fn()}
        onStageDrop={vi.fn()}
        onSelectDeal={vi.fn()}
        selectedDealId={null}
      />,
    );

    expect(screen.getByText("Maria Silva")).toBeInTheDocument();
    expect(screen.getByText("ACME")).toBeInTheDocument();
  });
});
