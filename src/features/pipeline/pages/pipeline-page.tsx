import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getTeamMembers } from "@/api/auth";
import { createDeal, deleteDeal, getPipelineBoard, moveDeal } from "@/api/pipeline";
import { FullscreenState } from "@/components/feedback/fullscreen-state";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { KanbanBoard } from "@/features/pipeline/components/kanban-board";
import { PipelineLeadCreateCard } from "@/features/pipeline/components/pipeline-lead-create-card";
import type { BoardDeal, BoardStage, PipelineBoard } from "@/types/pipeline";
import type { LeadListItem } from "@/types/leads";

interface DraggingDealState {
  deal: BoardDeal;
  fromStageId: string;
}

type DraggingItemState =
  | {
      type: "deal";
      deal: BoardDeal;
      fromStageId: string;
    }
  | {
      type: "lead";
      lead: LeadListItem;
    };

function moveBoardDeal(board: PipelineBoard, draggingDeal: DraggingDealState, targetStage: BoardStage) {
  const nextStages = board.stages.map((stage) => ({
    ...stage,
    deals: [...stage.deals],
  }));

  const sourceStage = nextStages.find((stage) => stage.id === draggingDeal.fromStageId);
  const destinationStage = nextStages.find((stage) => stage.id === targetStage.id);
  if (!sourceStage || !destinationStage) {
    return board;
  }

  const sourceIndex = sourceStage.deals.findIndex((deal) => deal.id === draggingDeal.deal.id);
  if (sourceIndex === -1) {
    return board;
  }

  sourceStage.deals.splice(sourceIndex, 1);
  destinationStage.deals.push(draggingDeal.deal);

  return {
    ...board,
    stages: nextStages.map((stage) => ({
      ...stage,
      deals: stage.deals.map((deal, index) => ({
        ...deal,
        position: index,
      })),
    })),
  };
}

function removeBoardDeal(board: PipelineBoard, dealId: string) {
  return {
    ...board,
    stages: board.stages.map((stage) => ({
      ...stage,
      deals: stage.deals
        .filter((deal) => deal.id !== dealId)
        .map((deal, index) => ({
          ...deal,
          position: index,
        })),
    })),
  };
}

export function PipelinePage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [boardState, setBoardState] = useState<PipelineBoard | null>(null);
  const [draggingItem, setDraggingItem] = useState<DraggingItemState | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [pendingLeadId, setPendingLeadId] = useState<string | null>(null);
  const [deletingDealId, setDeletingDealId] = useState<string | null>(null);
  const [moveError, setMoveError] = useState("");
  const [selectedMemberUserId, setSelectedMemberUserId] = useState<string | null>(null);

  const currentRole = user?.current_membership?.role ?? null;
  const canChooseBoardMember = currentRole === "owner" || currentRole === "admin";

  const teamMembersQuery = useQuery({
    queryKey: ["auth", "team-members"],
    queryFn: getTeamMembers,
    enabled: canChooseBoardMember,
  });

  useEffect(() => {
    if (!user) {
      setSelectedMemberUserId(null);
      return;
    }

    if (!canChooseBoardMember) {
      setSelectedMemberUserId(user.id);
      return;
    }

    const teamMembers = teamMembersQuery.data ?? [];
    if (!teamMembers.length) {
      setSelectedMemberUserId(user.id);
      return;
    }

    const hasSelectedMember = teamMembers.some((member) => member.user_id === selectedMemberUserId);
    if (!selectedMemberUserId || !hasSelectedMember) {
      setSelectedMemberUserId(user.id);
    }
  }, [canChooseBoardMember, selectedMemberUserId, teamMembersQuery.data, user]);

  const boardMemberUserId = canChooseBoardMember ? selectedMemberUserId ?? user?.id ?? undefined : undefined;

  const boardQuery = useQuery({
    queryKey: ["pipeline-board", boardMemberUserId ?? "self"],
    queryFn: () => getPipelineBoard(boardMemberUserId),
  });

  useEffect(() => {
    if (boardQuery.data) {
      setBoardState(boardQuery.data);
      if (!selectedDealId) {
        const firstDeal = boardQuery.data.stages.flatMap((stage) => stage.deals)[0];
        setSelectedDealId(firstDeal?.id ?? null);
        return;
      }

      const hasSelectedDeal = boardQuery.data.stages.some((stage) =>
        stage.deals.some((deal) => deal.id === selectedDealId),
      );
      if (!hasSelectedDeal) {
        setSelectedDealId(boardQuery.data.stages.flatMap((stage) => stage.deals)[0]?.id ?? null);
      }
    }
  }, [boardQuery.data, selectedDealId]);

  const moveDealMutation = useMutation({
    mutationFn: moveDeal,
    onSuccess: async (updatedDeal) => {
      setMoveError("");
      await queryClient.invalidateQueries({ queryKey: ["pipeline-board"] });
      await queryClient.invalidateQueries({ queryKey: ["deal", updatedDeal.id] });
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      await queryClient.invalidateQueries({ queryKey: ["lead", updatedDeal.lead.id] });
      await queryClient.invalidateQueries({ queryKey: ["deal-timeline", updatedDeal.id] });
    },
    onError: (error) => {
      setMoveError(error instanceof Error ? error.message : "Nao foi possivel mover o deal.");
    },
  });

  const createDealMutation = useMutation({
    mutationFn: ({
      lead,
      stage,
      lostReason,
    }: {
      lead: LeadListItem;
      stage: BoardStage;
      lostReason?: string;
    }) =>
      createDeal({
        leadId: lead.id,
        title: `Oportunidade - ${lead.full_name}`,
        amount: lead.estimated_value || undefined,
        lostReason,
        stageId: stage.id,
        ownerId: boardMemberUserId,
      }),
    onMutate: ({ lead }) => {
      setPendingLeadId(lead.id);
      setMoveError("");
    },
    onSuccess: async (deal) => {
      setPendingLeadId(null);
      setSelectedDealId(deal.id);
      await queryClient.invalidateQueries({ queryKey: ["pipeline-board"] });
      await queryClient.invalidateQueries({ queryKey: ["deal", deal.id] });
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      await queryClient.invalidateQueries({ queryKey: ["lead", deal.lead.id] });
      await queryClient.invalidateQueries({ queryKey: ["analytics-dashboard"] });
    },
    onError: (error) => {
      setPendingLeadId(null);
      setMoveError(error instanceof Error ? error.message : "Nao foi possivel adicionar o lead ao pipeline.");
    },
  });

  const deleteDealMutation = useMutation({
    mutationFn: deleteDeal,
    onMutate: (dealId) => {
      setDeletingDealId(dealId);
      setMoveError("");
    },
    onSuccess: async (_, dealId) => {
      setDeletingDealId(null);
      if (selectedDealId === dealId) {
        setSelectedDealId(null);
      }
      await queryClient.invalidateQueries({ queryKey: ["pipeline-board"] });
      await queryClient.invalidateQueries({ queryKey: ["deal", dealId] });
      await queryClient.invalidateQueries({ queryKey: ["deal-timeline", dealId] });
      await queryClient.invalidateQueries({ queryKey: ["analytics-dashboard"] });
    },
    onError: (error) => {
      setDeletingDealId(null);
      setMoveError(error instanceof Error ? error.message : "Nao foi possivel excluir o deal.");
    },
  });

  function createLeadDeal(lead: LeadListItem, stage: BoardStage) {
    let lostReason = "";

    if (stage.kind === "lost") {
      lostReason = window.prompt("Informe o motivo da perda para criar o card nessa etapa.")?.trim() ?? "";
      if (!lostReason) {
        return;
      }
    }

    createDealMutation.mutate({
      lead,
      stage,
      lostReason,
    });
  }

  function handleStageDrop(targetStage: BoardStage) {
    if (!draggingItem || !boardState) {
      return;
    }

    if (draggingItem.type === "lead") {
      setDraggingItem(null);
      createLeadDeal(draggingItem.lead, targetStage);
      return;
    }

    if (draggingItem.fromStageId === targetStage.id) {
      setDraggingItem(null);
      return;
    }

    const previousBoard = boardState;
    const nextBoard = moveBoardDeal(boardState, draggingItem, targetStage);
    let lostReason = "";

    if (targetStage.kind === "lost") {
      lostReason = window.prompt("Informe o motivo da perda para concluir a movimentacao.")?.trim() ?? "";
      if (!lostReason) {
        setDraggingItem(null);
        return;
      }
    }

    setBoardState(nextBoard);
    setDraggingItem(null);
    moveDealMutation.mutate({
      dealId: draggingItem.deal.id,
      stageId: targetStage.id,
      position: Math.max(
        (nextBoard.stages.find((stage) => stage.id === targetStage.id)?.deals.length ?? 1) - 1,
        0,
      ),
      lostReason,
    }, {
      onError: () => {
        setBoardState(previousBoard);
      },
    });
  }

  function handleDeleteDeal(deal: BoardDeal) {
    if (!boardState || deleteDealMutation.isPending) {
      return;
    }

    const confirmed = window.confirm(`Excluir apenas o deal de ${deal.lead.full_name}? O contato sera mantido.`);
    if (!confirmed) {
      return;
    }

    const previousBoard = boardState;
    setBoardState(removeBoardDeal(boardState, deal.id));
    deleteDealMutation.mutate(deal.id, {
      onError: () => {
        setBoardState(previousBoard);
      },
    });
  }

  if (boardQuery.isLoading && !boardState) {
    return (
      <FullscreenState
        eyebrow="Pipeline"
        title="Carregando board comercial"
        description="Montando etapas, deals e historico do pipeline principal."
      />
    );
  }

  if (boardQuery.isError || !boardState) {
    return (
      <FullscreenState
        eyebrow="Pipeline"
        title="Nao foi possivel carregar o kanban"
        description="A operacao comercial depende do endpoint de board. Verifique a API e tente novamente."
      />
    );
  }

  return (
    <section className="stack">
      {canChooseBoardMember ? (
        <article className="card">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">Visualizacao</p>
              <h2>Pipeline individual por membro</h2>
            </div>
          </div>
          <label className="form-field">
            <span>Membro da equipe</span>
            <select
              value={selectedMemberUserId ?? user?.id ?? ""}
              disabled={teamMembersQuery.isLoading || !teamMembersQuery.data?.length}
              onChange={(event) => {
                setSelectedDealId(null);
                setSelectedMemberUserId(event.target.value);
              }}
            >
              {!teamMembersQuery.data?.length ? (
                <option value={selectedMemberUserId ?? user?.id ?? ""}>
                  {teamMembersQuery.isLoading ? "Carregando membros..." : "Nenhum membro disponivel"}
                </option>
              ) : (
                (teamMembersQuery.data ?? []).map((member) => (
                  <option key={member.id} value={member.user_id}>
                    {(member.full_name || member.email).trim()} ({member.role})
                  </option>
                ))
              )}
            </select>
          </label>
        </article>
      ) : null}
      <PipelineLeadCreateCard
        draggingLeadId={draggingItem?.type === "lead" ? draggingItem.lead.id : null}
        onLeadDragEnd={() => setDraggingItem(null)}
        onLeadDragStart={(lead) => {
          setMoveError("");
          setDraggingItem({ type: "lead", lead });
        }}
        pendingLeadId={pendingLeadId}
      />
      {moveError ? <p className="form-error">{moveError}</p> : null}

      <KanbanBoard
        deletingDealId={deletingDealId}
        stages={boardState.stages}
        draggingItemId={
          draggingItem?.type === "deal" ? draggingItem.deal.id : draggingItem?.type === "lead" ? draggingItem.lead.id : null
        }
        onDeleteDeal={handleDeleteDeal}
        onDealDragStart={(deal, stageId) => {
          setMoveError("");
          setDraggingItem({ type: "deal", deal, fromStageId: stageId });
          setSelectedDealId(deal.id);
        }}
        onDealDragEnd={() => setDraggingItem(null)}
        onStageDrop={handleStageDrop}
        onSelectDeal={setSelectedDealId}
        selectedDealId={selectedDealId}
      />
    </section>
  );
}
