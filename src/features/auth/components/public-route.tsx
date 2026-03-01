import type { PropsWithChildren } from "react";

import { Navigate } from "react-router-dom";

import { useAuthStore } from "@/features/auth/store/auth-store";

export function PublicRoute({ children }: PropsWithChildren) {
  const status = useAuthStore((state) => state.status);

  if (status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
