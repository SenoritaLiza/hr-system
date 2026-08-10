import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/Icon";
import styles from "@/components/ui/EmptyState.module.css";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  tone?: "neutral" | "critical";
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, tone = "neutral", action }: EmptyStateProps) {
  return (
    <div className={styles["empty-state"]}>
      <div
        className={styles["empty-icon-circle"]}
        style={
          tone === "critical"
            ? { background: "var(--critical-soft)", color: "var(--critical-ink)" }
            : undefined
        }
      >
        <Icon name={icon} />
      </div>
      <strong style={{ color: "var(--ink)", fontSize: ".95rem" }}>{title}</strong>
      <span>{description}</span>
      {action}
    </div>
  );
}

export function StateCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles["state-card"]}>
      <div className={styles["state-card-label"]}>{label}</div>
      {children}
    </div>
  );
}