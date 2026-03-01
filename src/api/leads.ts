import { apiFetch, apiFetchBlob } from "@/api/client";
import type { PaginatedResponse } from "@/types/common";
import type { LeadDetail, LeadListItem, LeadSource, LeadTag } from "@/types/leads";
import type { Interaction } from "@/types/interactions";

export interface LeadFilters {
  search?: string;
  status?: string;
  source?: string;
  tags?: string;
  ordering?: string;
  page?: number;
}

export interface LeadWritePayload {
  full_name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  job_title?: string;
  temperature?: "cold" | "warm" | "hot";
  estimated_value?: string;
  notes_summary?: string;
  source_id?: string;
  tag_ids?: string[];
}

function buildQuery(params: LeadFilters) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function getLeads(filters: LeadFilters) {
  return apiFetch<PaginatedResponse<LeadListItem>>(`/leads/${buildQuery(filters)}`);
}

export function createLead(payload: LeadWritePayload) {
  return apiFetch<LeadDetail>("/leads/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateLead(leadId: string, payload: LeadWritePayload) {
  return apiFetch<LeadDetail>(`/leads/${leadId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getLeadById(leadId: string) {
  return apiFetch<LeadDetail>(`/leads/${leadId}/`);
}

export function getLeadTimeline(leadId: string) {
  return apiFetch<PaginatedResponse<Interaction>>(`/leads/${leadId}/timeline/`);
}

export function getLeadSources() {
  return apiFetch<PaginatedResponse<LeadSource>>("/lead-sources/");
}

export function getLeadTags() {
  return apiFetch<PaginatedResponse<LeadTag>>("/tags/");
}

export function exportLeadsCsv() {
  return apiFetchBlob("/leads/export/");
}

export function importLeadsCsv(file: File, mapping: Record<string, string>) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mapping", JSON.stringify(mapping));

  return apiFetch<{ imported_count: number; error_count: number; errors: Array<{ row: number; error: string }> }>(
    "/leads/import_csv/",
    {
      method: "POST",
      body: formData,
    },
  );
}
