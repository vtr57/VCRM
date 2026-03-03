import { apiFetch } from "@/api/client";
import type { DashboardAnalytics } from "@/types/analytics";

export interface AnalyticsFilters {
  from?: string;
  to?: string;
  pipeline_id?: string;
}

function buildQuery(params: AnalyticsFilters) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!value) {
      continue;
    }
    searchParams.set(key, value);
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function getDashboardAnalytics(filters: AnalyticsFilters) {
  return apiFetch<DashboardAnalytics>(`/analytics/dashboard/${buildQuery(filters)}`);
}
