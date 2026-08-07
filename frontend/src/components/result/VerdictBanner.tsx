import { Icon } from "@/components/icons/Icon";
import { STATUS_ICON, STATUS_LABEL, computeStatus } from "@/lib/status";
import styles from "@/components/result/VerdictBanner.module.css";

export function VerdictBanner({ score, threshold }: { score: number; threshold: number }) {
  const status = computeStatus(score, threshold);
  const text =
    status === "good"
      ? "Рекомендован к собеседованию"
      : status === "warning"
        ? STATUS_LABEL[status] + " — требует ручного обзора"
        : "Не рекомендован";

  return (
    <div className={`${styles["verdict-banner"]} ${styles[status]}`}>
      <Icon name={STATUS_ICON[status]} />
      {text}
    </div>
  );
}