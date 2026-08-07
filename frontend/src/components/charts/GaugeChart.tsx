import { computeStatus } from "@/lib/status";
import styles from "@/components/charts/GaugeChart.module.css";

const HALF_CIRCUMFERENCE = Math.PI * 80;

const STATUS_COLOR: Record<string, string> = {
  good: "var(--good)",
  warning: "var(--warning)",
  critical: "var(--critical)",
};

export function GaugeChart({ score, threshold }: { score: number; threshold: number }) {
  const status = computeStatus(score, threshold);
  const filled = (score / 100) * HALF_CIRCUMFERENCE;

  return (
    <div className={styles["gauge-wrap"]}>
      <svg width="200" height="112" viewBox="0 0 200 112">
        <path
          d="M20,100 A80,80 0 0 1 180,100"
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={16}
          strokeLinecap="round"
        />
        <path
          d="M20,100 A80,80 0 0 1 180,100"
          fill="none"
          stroke={STATUS_COLOR[status]}
          strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={`${filled} 999`}
        />
      </svg>
      <div className={styles["gauge-value"]}>{score}%</div>
      <div className={styles["gauge-caption"]}>при пороге {threshold}%</div>
    </div>
  );
}