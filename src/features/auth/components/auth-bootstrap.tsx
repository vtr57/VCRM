import type { PropsWithChildren } from "react";

import { FullscreenState } from "@/components/feedback/fullscreen-state";
import { useAuthBootstrap } from "@/features/auth/hooks/use-auth-bootstrap";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function AuthBootstrap({ children }: PropsWithChildren) {
  const { isBootstrapping } = useAuthBootstrap();
  const hydrated = useAuthStore((state) => state.hydrated);
  const bootstrapComplete = useAuthStore((state) => state.bootstrapComplete);
  const hasSession = useAuthStore((state) => Boolean(state.accessToken || state.refreshToken));

  if (!hydrated || (hasSession && (!bootstrapComplete || isBootstrapping))) {
    return (
      <FullscreenState
        eyebrow="Inicializando"
        title="Preparando acesso"
        description="Validando a sessao persistida antes de liberar as rotas do CRM."
      />
    );
  }

  return <>{children}</>;
}
