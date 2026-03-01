import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  AuthMeResponse,
  AuthSessionResponse,
  AuthUser,
  OrganizationSummary,
} from "@/types/auth";

type AuthStatus = "authenticated" | "anonymous";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  organization: OrganizationSummary | null;
  activeOrganizationSlug: string | null;
  status: AuthStatus;
  hydrated: boolean;
  bootstrapComplete: boolean;
  setHydrated: () => void;
  setBootstrapped: (value: boolean) => void;
  setSession: (payload: AuthSessionResponse) => void;
  setCurrentContext: (payload: AuthMeResponse) => void;
  updateAccessToken: (accessToken: string) => void;
  clearSession: () => void;
}

function getOrganizationFromUser(user: AuthUser): OrganizationSummary | null {
  return user.current_membership?.organization ?? user.memberships[0]?.organization ?? null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      organization: null,
      activeOrganizationSlug: null,
      status: "anonymous",
      hydrated: false,
      bootstrapComplete: false,
      setHydrated: () => {
        set((state) => ({
          hydrated: true,
          status: state.accessToken || state.refreshToken ? state.status : "anonymous",
          bootstrapComplete: state.accessToken || state.refreshToken ? state.bootstrapComplete : true,
        }));
      },
      setBootstrapped: (value) => {
        set({ bootstrapComplete: value });
      },
      setSession: (payload) => {
        const organization = getOrganizationFromUser(payload.user);
        set({
          accessToken: payload.access,
          refreshToken: payload.refresh,
          user: payload.user,
          organization,
          activeOrganizationSlug: organization?.slug ?? null,
          status: "authenticated",
          bootstrapComplete: true,
        });
      },
      setCurrentContext: (payload) => {
        set({
          user: payload.user,
          organization: payload.organization,
          activeOrganizationSlug: payload.organization.slug,
          status: "authenticated",
          bootstrapComplete: true,
        });
      },
      updateAccessToken: (accessToken) => {
        set((state) => ({
          accessToken,
          status: state.refreshToken || accessToken ? "authenticated" : "anonymous",
        }));
      },
      clearSession: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          organization: null,
          activeOrganizationSlug: null,
          status: "anonymous",
          bootstrapComplete: true,
        });
      },
    }),
    {
      name: "crm-auth-session",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        organization: state.organization,
        activeOrganizationSlug: state.activeOrganizationSlug,
        status: state.status,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
