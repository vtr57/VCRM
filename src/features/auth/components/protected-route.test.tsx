import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { useAuthStore } from "@/features/auth/store/auth-store";

describe("ProtectedRoute", () => {
  afterEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      organization: null,
      activeOrganizationSlug: null,
      status: "anonymous",
      hydrated: true,
      bootstrapComplete: true,
    });
  });

  it("redirects anonymous users to login", () => {
    useAuthStore.setState({
      status: "anonymous",
      hydrated: true,
      bootstrapComplete: true,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/login"
            element={<div>Login screen</div>}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Private content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login screen")).toBeInTheDocument();
  });

  it("renders children for authenticated users", () => {
    useAuthStore.setState({
      status: "authenticated",
      hydrated: true,
      bootstrapComplete: true,
      accessToken: "token",
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Private content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Private content")).toBeInTheDocument();
  });
});
