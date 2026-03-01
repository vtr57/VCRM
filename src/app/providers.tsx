import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import { AppRouter } from "@/app/router";
import { AuthBootstrap } from "@/features/auth/components/auth-bootstrap";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthBootstrap>
          <AppRouter />
        </AuthBootstrap>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
