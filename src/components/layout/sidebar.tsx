import { NavLink } from "react-router-dom";

import { useSession } from "@/features/auth/hooks/use-session";
import { navigationItems } from "@/lib/navigation";

interface SidebarProps {
  isMobileLayout: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isMobileLayout, isOpen, onClose }: SidebarProps) {
  const { organization } = useSession();

  return (
    <aside
      aria-hidden={isMobileLayout && !isOpen}
      className={`sidebar${isOpen ? " is-open" : ""}`}
      id="app-sidebar"
    >
      <div className="sidebar__brand">
        <img className="sidebar__logo" src="/VCRM.png" alt="VCRM" />
        <h1 className="sidebar__title">VCRM</h1>
      </div>

      <nav className="sidebar__nav" aria-label="Principal">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar__link${isActive ? " is-active" : ""}`}
            onClick={isMobileLayout ? onClose : undefined}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <span className="sidebar__plan">{organization?.plan ?? "trial"}</span>
        <span className="sidebar__currency">{organization?.currency ?? "BRL"}</span>
      </div>
    </aside>
  );
}
