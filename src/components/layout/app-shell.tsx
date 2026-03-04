import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

const MOBILE_LAYOUT_QUERY = "(max-width: 960px)";

function getIsMobileLayout() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(MOBILE_LAYOUT_QUERY).matches;
}

export function AppShell() {
  const [isMobileLayout, setIsMobileLayout] = useState(() => getIsMobileLayout());
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => !getIsMobileLayout());

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(MOBILE_LAYOUT_QUERY);
    const handleLayoutChange = (event: MediaQueryListEvent) => {
      setIsMobileLayout(event.matches);
      setIsSidebarOpen(!event.matches);
    };

    setIsMobileLayout(mediaQuery.matches);
    setIsSidebarOpen(!mediaQuery.matches);
    mediaQuery.addEventListener("change", handleLayoutChange);
    return () => mediaQuery.removeEventListener("change", handleLayoutChange);
  }, []);

  function handleToggleSidebar() {
    setIsSidebarOpen((current) => !current);
  }

  function handleCloseSidebar() {
    setIsSidebarOpen(false);
  }

  const appShellClassName = `app-shell${isMobileLayout ? " is-mobile-layout" : ""}${isSidebarOpen ? " is-sidebar-open" : ""}`;

  return (
    <div className={appShellClassName}>
      <Sidebar isMobileLayout={isMobileLayout} isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      {isMobileLayout && isSidebarOpen ? (
        <button
          aria-label="Fechar menu"
          className="app-shell__backdrop"
          type="button"
          onClick={handleCloseSidebar}
        />
      ) : null}
      <div className="app-shell__content">
        <Topbar
          isMobileLayout={isMobileLayout}
          isSidebarOpen={isSidebarOpen}
          onMenuToggle={handleToggleSidebar}
        />
        <main className="page-container" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
