import type { CSSProperties } from "react";
import styles from "@/components/ui/ProgressBar.module.css";

export function ProgressBar({ percent, style }: { percent: number; style?: CSSProperties }) {
  return (
    <div className={styles["progress-track"]} style={style}>
      <div className={styles["progress-fill"]} style={{ width: `${percent}%` }} />
    </div>
  );
}