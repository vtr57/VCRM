import { apiFetch } from "@/api/client";
import type { AuthMeResponse, AuthSessionResponse, TeamMember } from "@/types/auth";

export interface LoginPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload) {
  return apiFetch<AuthSessionResponse>(
    "/auth/login/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    { auth: false, retryOnAuth: false },
  );
}

export async function getCurrentSession() {
  return apiFetch<AuthMeResponse>("/auth/me/");
}

export async function getTeamMembers() {
  return apiFetch<TeamMember[]>("/auth/team-members/");
}
