export interface LeadSource {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadTag {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface LeadUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
export type LeadTemperature = "cold" | "warm" | "hot";

export interface LeadListItem {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  job_title: string;
  status: LeadStatus;
  temperature: LeadTemperature;
  estimated_value: string;
  notes_summary: string;
  last_interaction_at: string | null;
  next_action_at: string | null;
  source: LeadSource | null;
  tags: LeadTag[];
  assigned_to: LeadUser | null;
  created_by: LeadUser;
  created_at: string;
  updated_at: string;
}

export type LeadDetail = LeadListItem;
