import type { ExplanationFactor } from "@/types/screening";
import styles from "@/components/result/FactorList.module.css";

const MAX_ABS_WEIGHT = 0.45;

export function FactorList({ factors, sign }: { factors: ExplanationFactor[]; sign: "pos" | "neg" }) {
  return (
    <div className={styles["factor-list"]}>
      {factors.map((factor) => (
        <div key={factor.label} className={styles["factor-row"]}>
          <span className={styles["factor-label"]}>{factor.label}</span>
          <div className={styles["factor-bar-track"]}>
            <div
              className={`${styles["factor-bar-fill"]} ${styles[sign]}`}
              style={{ width: `${(Math.abs(factor.weight) / MAX_ABS_WEIGHT) * 100}%` }}
            />
          </div>
          <span className={`${styles["factor-weight"]} num`}>
            {factor.weight > 0 ? "+" : ""}
            {factor.weight.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}