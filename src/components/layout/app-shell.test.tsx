import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/layout/app-shell";

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

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

    expect(screen.getByText("VCRM")).toBeInTheDocument();
    expect(screen.getByText("Dashboard content")).toBeInTheDocument();
  });

  it("toggles sidebar in mobile layout", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(max-width: 960px)",
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<div>Dashboard content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    const menuButton = screen.getByRole("button", { name: "Abrir menu" });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector(".app-shell")).toHaveClass("is-sidebar-open");
  });
});
