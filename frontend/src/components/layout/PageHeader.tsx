import type { ReactNode } from "react";
import styles from "@/components/layout/PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className={styles["view-header"]}>
      <div>
        <div className={styles["view-title"]}>{title}</div>
        <div className={styles["view-sub"]}>{subtitle}</div>
      </div>
      {action}
    </div>
  );
}