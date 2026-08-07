import { useNavigate } from "react-router-dom";
import type { BadgeVariant } from "@/components/ui/Badge";
import type { IconName } from "@/components/icons/Icon";
import type { PipelineCard, PipelineStage } from "@/types/vacancy";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useThreshold } from "@/context/ThresholdContext";
import { computeStatus, STATUS_ICON, STATUS_LABEL } from "@/lib/status";
import { candidateResultPath } from "@/router/paths";
import styles from "@/components/vacancies/Kanban.module.css";

const CARD_BADGE: Record<ReturnType<typeof computeStatus> | "unscored", { variant: BadgeVariant; icon?: IconName; label: string }> = {
  good: { variant: "good", icon: STATUS_ICON.good, label: STATUS_LABEL.good },
  warning: { variant: "warning", icon: STATUS_ICON.warning, label: STATUS_LABEL.warning },
  critical: { variant: "critical", icon: STATUS_ICON.critical, label: STATUS_LABEL.critical },
  unscored: { variant: "neutral", label: "Без оценки" },
};

export function Kanban({ stages }: { stages: PipelineStage[] }) {
  return (
    <div className={styles.kanban}>
      {stages.map((stage) => (
        <div key={stage.id} className={styles["kanban-col"]}>
          <div className={styles["kanban-col-head"]}>
            {stage.label}
            <span className={styles.num}>{stage.total}</span>
          </div>
          <div className={styles["kanban-body"]}>
            {stage.cards.map((card) => (
              <KanbanCardItem key={card.candidateId} card={card} />
            ))}
            {stage.moreCount > 0 && <div className={styles["kanban-more"]}>+ {stage.moreCount} ещё</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function KanbanCardItem({ card }: { card: PipelineCard }) {
  const navigate = useNavigate();
  const { threshold } = useThreshold();
  const status = card.score === null ? "unscored" : computeStatus(card.score, threshold);
  const badge = CARD_BADGE[status];

  return (
    <div
      className={styles["kanban-card"]}
      style={{ cursor: "pointer" }}
      onClick={() => navigate(candidateResultPath(card.candidateId))}
    >
      <div className={styles["kanban-card-top"]}>
        <Avatar initials={card.initials} size={26} />
        <div className={styles["kanban-card-name"]}>
          {card.name}
          <span>{card.note}</span>
        </div>
      </div>
      <Badge variant={badge.variant} icon={badge.icon}>
        {badge.label}
      </Badge>
    </div>
  );
}