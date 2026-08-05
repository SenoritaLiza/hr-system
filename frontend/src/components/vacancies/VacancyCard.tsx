import { useNavigate } from "react-router-dom";
import type { Vacancy } from "@/types/vacancy";
import { Icon } from "@/components/icons/Icon";
import { Badge } from "@/components/ui/Badge";
import { vacancyPipelinePath } from "@/router/paths";
import styles from "@/components/vacancies/VacancyCard.module.css";

const STATUS_BADGE: Record<Vacancy["status"], { variant: "good" | "neutral"; icon?: "check-circle" }> = {
  open: { variant: "good", icon: "check-circle" },
  paused: { variant: "neutral" },
  closed: { variant: "neutral" },
};

export function VacancyCard({ vacancy }: { vacancy: Vacancy }) {
  const navigate = useNavigate();
  const badge = STATUS_BADGE[vacancy.status];

  return (
    <div
      className={styles["vac-card"]}
      style={{ cursor: "pointer" }}
      onClick={() => navigate(vacancyPipelinePath(vacancy.id))}
    >
      <div className={styles["vac-icon"]}>
        <Icon name="briefcase" />
      </div>
      <div className={styles["vac-main"]}>
        <strong>{vacancy.title}</strong>
        <span>
          {vacancy.department} · {vacancy.openedLabel} · {vacancy.owner}
        </span>
      </div>
      <div className={styles["vac-stat"]}>
        <span className={`${styles.num} num`}>{vacancy.inPipeline}</span>
        <span className={styles.l}>в воронке</span>
      </div>
      <div className={styles["vac-stat"]}>
        <span className={`${styles.num} num`}>{vacancy.inInterview ?? "—"}</span>
        <span className={styles.l}>на интервью</span>
      </div>
      <Badge variant={badge.variant} icon={badge.icon}>
        {vacancy.statusLabel}
      </Badge>
      <Icon name="chevron-right" style={{ color: "var(--ink-muted)" }} />
    </div>
  );
}