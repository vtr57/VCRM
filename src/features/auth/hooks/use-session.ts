import { useAuthStore } from "@/features/auth/store/auth-store";

export function useSession() {
  const user = useAuthStore((state) => state.user);
  const organization = useAuthStore((state) => state.organization);
  const status = useAuthStore((state) => state.status);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setSession = useAuthStore((state) => state.setSession);

  return {
    user,
    organization,
    status,
    clearSession,
    setSession,
  };
}
