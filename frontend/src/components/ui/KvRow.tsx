import type { ReactNode } from "react";
import styles from "@/components/ui/KvRow.module.css";

export function KvRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className={styles["kv-row"]}>
      <span className={styles.k}>{label}</span>
      <span className={styles.v}>{value}</span>
    </div>
  );
}