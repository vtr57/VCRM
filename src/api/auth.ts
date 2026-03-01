import { apiFetch } from "@/api/client";
import type { AuthMeResponse, AuthSessionResponse } from "@/types/auth";

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
