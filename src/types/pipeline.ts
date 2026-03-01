import type { LeadListItem, LeadUser } from "@/types/leads";

export type DealStatus = "open" | "won" | "lost";
export type StageKind = "open" | "won" | "lost";

export interface PipelineSummary {
  id: string;
  name: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StageSummary {
  id: string;
  pipeline?: string;
  name: string;
  slug: string;
  order: number;
  color: string;
  probability: number;
  kind: StageKind;
  wip_limit: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface DealListItem {
  id: string;
  title: string;
  amount: string;
  status: DealStatus;
  position: number;
  expected_close_date: string | null;
  closed_at: string | null;
  lost_reason: string;
  lead: LeadListItem;
  owner: LeadUser | null;
  created_by: LeadUser;
  created_at: string;
  updated_at: string;
}

export interface DealDetail extends DealListItem {
  stage: StageSummary;
  pipeline: PipelineSummary;
}

export interface BoardLeadSummary {
  id: string;
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  status: string;
}

export interface BoardDeal {
  id: string;
  title: string;
  amount: string;
  status: DealStatus;
  position: number;
  expected_close_date: string | null;
  closed_at: string | null;
  lead: BoardLeadSummary;
  owner: LeadUser | null;
}

export interface BoardStage {
  id: string;
  name: string;
  slug: string;
  order: number;
  color: string;
  probability: number;
  kind: StageKind;
  wip_limit: number | null;
  deals: BoardDeal[];
}

export interface PipelineBoard {
  pipeline: PipelineSummary;
  stages: BoardStage[];
}
