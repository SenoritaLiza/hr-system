import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Role } from "@/types/common";

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("recruiter");
  const value = useMemo(() => ({ role, setRole }), [role]);
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}

// Пока нет авторизации — заглушки персон для демонстрации переключения ролей.
// Заменится на реальные данные пользователя в feature/auth-roles.
const PERSONAS: Record<Role, { name: string; initials: string; roleLabel: string }> = {
  recruiter: { name: "Елизавета Ныркова", initials: "ЕН", roleLabel: "HR-менеджер" },
  admin: { name: "Артур Беленко", initials: "АБ", roleLabel: "Администратор" },
};

export function useCurrentPersona() {
  const { role } = useRole();
  return PERSONAS[role];
}