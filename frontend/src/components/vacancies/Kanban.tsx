import { useNavigate } from "react-router-dom";
import type { BadgeVariant } from "@/components/ui/Badge";
import type { IconName } from "@/components/icons/Icon";
import type { PipelineCard, PipelineStage } from "@/types/vacancy";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { candidateResultPath } from "@/router/paths";
import styles from "@/components/vacancies/Kanban.module.css";

const CARD_BADGE: Record<PipelineCard["status"], { variant: BadgeVariant; icon?: IconName }> = {
  good: { variant: "good", icon: "check-circle" },
  warning: { variant: "warning", icon: "alert-triangle" },
  critical: { variant: "critical", icon: "x-circle" },
  unscored: { variant: "neutral" },
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
  const badge = CARD_BADGE[card.status];

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
        {card.statusLabel}
      </Badge>
    </div>
  );
}