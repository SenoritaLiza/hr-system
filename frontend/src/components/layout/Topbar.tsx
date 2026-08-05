import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/icons/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { useRole, useCurrentPersona } from "@/context/RoleContext";
import { usePageTitleValue } from "@/context/PageTitleContext";
import { PATHS } from "@/router/paths";
import styles from "@/components/layout/Topbar.module.css";

export function Topbar() {
  const title = usePageTitleValue();
  const { role, setRole } = useRole();
  const persona = useCurrentPersona();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const goToSettings = () => {
    setMenuOpen(false);
    navigate(PATHS.settings);
  };

  const switchRole = () => {
    setMenuOpen(false);
    setRole(role === "admin" ? "recruiter" : "admin");
    navigate(PATHS.dashboard);
  };

  return (
    <header className={styles.topbar}>
      <h1>{title}</h1>
      <div className={styles["topbar-spacer"]} />
      <div className={styles["topbar-search"]}>
        <Icon name="search" />
        <input placeholder="Поиск кандидата, вакансии…" />
      </div>
      <button type="button" className={styles["icon-btn"]} title="Уведомления" aria-label="Уведомления">
        <Icon name="bell" />
        <span className={styles["dot-badge"]} />
      </button>
      <div className={styles["topbar-menu-wrap"]}>
        <button
          type="button"
          className={styles["icon-btn"]}
          style={{ width: "auto", borderRadius: 99, padding: "0 .5rem 0 0", gap: ".4rem", display: "flex", alignItems: "center" }}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Меню аккаунта"
        >
          <Avatar initials={persona.initials} size={32} />
          <Icon name="chevron-down" style={{ width: 14, height: 14 }} />
        </button>
        <div className={`${styles.dropdown}${menuOpen ? ` ${styles.open}` : ""}`}>
          <button type="button" className={styles["dropdown-item"]} onClick={goToSettings}>
            <Icon name="settings" />
            Профиль и настройки
          </button>
          <button type="button" className={styles["dropdown-item"]} onClick={switchRole}>
            <Icon name="log-out" />
            Войти как {role === "admin" ? "рекрутер" : "администратор"}
          </button>
        </div>
      </div>
    </header>
  );
}