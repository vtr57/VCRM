import { apiFetch } from "@/api/client";
import type { PaginatedResponse } from "@/types/common";
import type { Interaction, InteractionDirection, InteractionType } from "@/types/interactions";

export interface InteractionPayload {
  lead_id: string;
  deal_id?: string | null;
  type: InteractionType;
  direction?: InteractionDirection;
  subject?: string;
  content: string;
  outcome?: string;
  occurred_at?: string;
}

export function createInteraction(payload: InteractionPayload) {
  return apiFetch<Interaction>("/interactions/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getDealTimeline(dealId: string) {
  return apiFetch<PaginatedResponse<Interaction>>(`/deals/${dealId}/timeline/`);
}
