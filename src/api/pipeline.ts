import { apiFetch } from "@/api/client";
import type { DealDetail, PipelineBoard } from "@/types/pipeline";

export interface CreateDealPayload {
  leadId: string;
  title: string;
  amount?: string;
  expectedCloseDate?: string;
  lostReason?: string;
  pipelineId?: string;
  stageId?: string;
  ownerId?: string;
}

export function getPipelineBoard() {
  return apiFetch<PipelineBoard>("/pipelines/board/");
}

export function getDealById(dealId: string) {
  return apiFetch<DealDetail>(`/deals/${dealId}/`);
}

export function deleteDeal(dealId: string) {
  return apiFetch<void>(`/deals/${dealId}/`, {
    method: "DELETE",
  });
}

export function createDeal(payload: CreateDealPayload) {
  return apiFetch<DealDetail>("/deals/", {
    method: "POST",
    body: JSON.stringify({
      lead_id: payload.leadId,
      title: payload.title,
      amount: payload.amount,
      expected_close_date: payload.expectedCloseDate,
      lost_reason: payload.lostReason,
      pipeline_id: payload.pipelineId,
      stage_id: payload.stageId,
      owner_id: payload.ownerId,
    }),
  });
}

export function moveDeal(
  payload: { dealId: string; stageId: string; position?: number; note?: string; lostReason?: string },
) {
  return apiFetch<DealDetail>(`/deals/${payload.dealId}/move/`, {
    method: "POST",
    body: JSON.stringify({
      stage_id: payload.stageId,
      position: payload.position,
      note: payload.note,
      lost_reason: payload.lostReason,
    }),
  });
}
