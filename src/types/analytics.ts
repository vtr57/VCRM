import type { PipelineSummary } from "@/types/pipeline";

export interface AnalyticsPeriod {
  from: string;
  to: string;
}

export interface DashboardKpis {
  total_leads: number;
  total_deals: number;
  won_deals: number;
  conversion_rate: number;
  open_pipeline_value: string;
  closed_amount: string;
  average_ticket: string;
}

export interface LeadsBySourcePoint {
  source_id: string | null;
  source_name: string | null;
  lead_count: number;
}

export interface DealsByStagePoint {
  stage_id: string;
  stage_name: string;
  stage_color: string;
  stage_order: number;
  deal_count: number;
  total_amount: string;
}

export interface WonAmountByPeriodPoint {
  period: string;
  amount: string;
  won_count: number;
}

export interface DashboardAnalytics {
  period: AnalyticsPeriod;
  pipeline: PipelineSummary | null;
  kpis: DashboardKpis;
  leads_by_source: LeadsBySourcePoint[];
  deals_by_stage: DealsByStagePoint[];
  won_amount_by_period: WonAmountByPeriodPoint[];
}

export interface StageConversionResult {
  stage_id: string;
  stage_name: string;
  stage_kind: string;
  stage_color: string;
  entered_deals: number;
  won_deals: number;
  conversion_rate: number;
  current_deals: number;
  current_amount: string;
}

export interface StageConversionReport {
  period: AnalyticsPeriod;
  pipeline: PipelineSummary | null;
  results: StageConversionResult[];
}

export interface OwnerConversionResult {
  owner_id: string | null;
  owner_name: string;
  owner_email: string | null;
  total_deals: number;
  open_deals: number;
  won_deals: number;
  lost_deals: number;
  open_amount: string;
  won_amount: string;
  conversion_rate: number;
}

export interface OwnerConversionReport {
  period: AnalyticsPeriod;
  results: OwnerConversionResult[];
}

export interface SourceProfitabilityResult {
  source_id: string | null;
  source_name: string;
  total_leads: number;
  total_deals: number;
  won_deals: number;
  won_amount: string;
  open_amount: string;
  conversion_rate: number;
}

export interface SourceProfitabilityReport {
  period: AnalyticsPeriod;
  results: SourceProfitabilityResult[];
}
