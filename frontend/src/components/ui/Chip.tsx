import type { CSSProperties, ReactNode } from "react";
import styles from "@/components/ui/Chip.module.css";

export function Chip({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span className={styles.chip} style={style}>
      {children}
    </span>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return <div className={styles["chip-row"]}>{children}</div>;
}