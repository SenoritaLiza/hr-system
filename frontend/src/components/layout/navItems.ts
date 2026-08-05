import type { IconName } from "@/components/icons/Icon";
import { PATHS } from "@/router/paths";

export interface NavItem {
  to: string;
  icon: IconName;
  label: string;
  badgeKey?: "vacancies" | "candidates" | "favorites";
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const RECRUITER_NAV: NavSection[] = [
  {
    label: "Обзор",
    items: [
      { to: PATHS.dashboard, icon: "grid", label: "Дашборд" },
      { to: PATHS.vacancies, icon: "briefcase", label: "Вакансии", badgeKey: "vacancies" },
      { to: PATHS.upload, icon: "upload", label: "Загрузить резюме" },
    ],
  },
  {
    label: "Кандидаты",
    items: [
      { to: PATHS.candidates, icon: "users", label: "Все кандидаты", badgeKey: "candidates" },
      { to: PATHS.favorites, icon: "star", label: "Избранное", badgeKey: "favorites" },
    ],
  },
  {
    label: "Аналитика",
    items: [
      { to: PATHS.metrics, icon: "chart", label: "Метрики моделей" },
      { to: PATHS.analytics, icon: "trend", label: "Аналитика найма" },
      { to: PATHS.settings, icon: "settings", label: "Настройки" },
    ],
  },
];

export const ADMIN_NAV: NavSection[] = [
  ...RECRUITER_NAV,
  {
    label: "Администрирование",
    items: [
      { to: PATHS.adminTeam, icon: "users", label: "Команда" },
      { to: PATHS.adminSystem, icon: "cpu", label: "Система" },
      { to: PATHS.adminAudit, icon: "history", label: "Аудит" },
    ],
  },
];