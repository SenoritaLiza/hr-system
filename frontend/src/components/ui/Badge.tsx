import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/Icon";
import styles from "@/components/ui/Badge.module.css";

export type BadgeVariant = "good" | "warning" | "serious" | "critical" | "neutral" | "admin-role" | "invited";

interface BadgeProps {
  variant: BadgeVariant;
  icon?: IconName;
  children: ReactNode;
}

export function Badge({ variant, icon, children }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[`badge-${variant}`]}`}>
      {icon && <Icon name={icon} />}
      {children}
    </span>
  );
}