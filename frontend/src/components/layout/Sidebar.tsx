import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Icon } from "@/components/icons/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { useRole, useCurrentPersona } from "@/context/RoleContext";
import { useCandidates } from "@/context/CandidatesContext";
import { fetchVacancies } from "@/lib/vacanciesApi";
import { ADMIN_NAV, RECRUITER_NAV, type NavItem } from "@/components/layout/navItems";
import { PATHS } from "@/router/paths";
import styles from "@/components/layout/Sidebar.module.css";

export function Sidebar() {
  const { role } = useRole();
  const persona = useCurrentPersona();
  const { candidates } = useCandidates();
  const [openVacancies, setOpenVacancies] = useState(0);

  useEffect(() => {
    fetchVacancies()
      .then((list) => setOpenVacancies(list.filter((v) => v.status !== "closed").length))
      .catch(() => setOpenVacancies(0));
  }, []);

  const badges: Record<string, number> = {
    vacancies: openVacancies,
    candidates: candidates.length,
    favorites: candidates.filter((c) => c.favorite).length,
  };

  const sections = role === "admin" ? ADMIN_NAV : RECRUITER_NAV;

  return (
    <aside className={styles.sidebar}>
      <div className={styles["sidebar-brand"]}>
        <div className={styles["brand-mark"]}>
          <Icon name="cpu" style={{ width: 18, height: 18 }} />
        </div>
        <div className={styles["brand-text"]}>
          <strong>AI HR Ассистент</strong>
          <span>Скрининг резюме</span>
        </div>
      </div>

      <nav className={styles["sidebar-nav"]}>
        {sections.map((section) => (
          <div key={section.label}>
            <div className={styles["sidebar-section-label"]}>{section.label}</div>
            {section.items.map((item) => (
              <SidebarLink key={item.to} item={item} badge={item.badgeKey ? badges[item.badgeKey] : undefined} />
            ))}
          </div>
        ))}
      </nav>

      <div className={styles["sidebar-footer"]}>
        <button type="button" className={styles["user-chip"]}>
          <Avatar initials={persona.initials} />
          <div className={styles["user-chip-meta"]}>
            <strong>{persona.name}</strong>
            <span>{persona.roleLabel}</span>
          </div>
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({ item, badge }: { item: NavItem; badge?: number }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === PATHS.dashboard}
      className={({ isActive }) => `${styles["sidebar-link"]}${isActive ? ` ${styles.active}` : ""}`}
    >
      <Icon name={item.icon} />
      <span>{item.label}</span>
      {badge !== undefined && <span className={styles["badge-count"]}>{badge}</span>}
    </NavLink>
  );
}
