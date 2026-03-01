import type { LeadUser } from "@/types/leads";

export type InteractionType = "call" | "message" | "email" | "meeting" | "note";
export type InteractionDirection = "inbound" | "outbound" | "internal";

export interface Interaction {
  id: string;
  lead: string;
  deal: string | null;
  type: InteractionType;
  direction: InteractionDirection;
  subject: string;
  content: string;
  outcome: string;
  occurred_at: string;
  created_by: LeadUser;
  created_at: string;
  updated_at: string;
}
