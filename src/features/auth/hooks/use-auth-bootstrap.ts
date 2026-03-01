import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import { getCurrentSession } from "@/api/auth";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function useAuthBootstrap() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const setCurrentContext = useAuthStore((state) => state.setCurrentContext);
  const setBootstrapped = useAuthStore((state) => state.setBootstrapped);
  const clearSession = useAuthStore((state) => state.clearSession);

  const query = useQuery({
    queryKey: ["auth", "bootstrap", refreshToken],
    queryFn: getCurrentSession,
    enabled: hydrated && Boolean(accessToken || refreshToken),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!accessToken && !refreshToken) {
      setBootstrapped(true);
    }
  }, [accessToken, hydrated, refreshToken, setBootstrapped]);

  useEffect(() => {
    if (!query.isSuccess) {
      return;
    }

    setCurrentContext(query.data);
  }, [query.data, query.isSuccess, setCurrentContext]);

  useEffect(() => {
    if (!query.isError) {
      return;
    }

    clearSession();
  }, [clearSession, query.isError]);

  return {
    isBootstrapping: hydrated && Boolean(accessToken || refreshToken) && query.isLoading,
  };
}
