import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";

describe("AppShell", () => {
  it("renders the shared navigation", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<div>Dashboard content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Sales Command")).toBeInTheDocument();
    expect(screen.getByText("Dashboard content")).toBeInTheDocument();
  });
});
