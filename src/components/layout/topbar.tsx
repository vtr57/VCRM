import { useLocation, useNavigate } from "react-router-dom";

import { useSession } from "@/features/auth/hooks/use-session";
import { navigationItems } from "@/lib/navigation";

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, organization, clearSession } = useSession();

  const currentItem =
    navigationItems.find((item) => location.pathname.startsWith(item.to)) ?? navigationItems[0];

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <header className="topbar">
      <div>
        <p className="topbar__eyebrow">{currentItem.eyebrow}</p>
        <h2 className="topbar__title">{currentItem.title}</h2>
      </div>
      <div className="topbar__actions">
        <div className="topbar__identity">
          <span className="topbar__org">{organization?.slug ?? "workspace"}</span>
          <strong>{user?.full_name || user?.email || "Usuario"}</strong>
        </div>
        <button className="topbar__button" type="button" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </header>
  );
}
