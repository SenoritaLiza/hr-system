import { useNavigate } from "react-router-dom";
import type { PipelineCard, PipelineStage } from "@/types/vacancy";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { STATUS_ICON } from "@/lib/status";
import { candidateResultPath } from "@/router/paths";
import styles from "@/components/vacancies/Kanban.module.css";

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
  const isRealCandidate = !card.candidateId.startsWith("cx");

  return (
    <div
      className={styles["kanban-card"]}
      style={isRealCandidate ? { cursor: "pointer" } : undefined}
      onClick={() => isRealCandidate && navigate(candidateResultPath(card.candidateId))}
    >
      <div className={styles["kanban-card-top"]}>
        <Avatar initials={card.initials} size={26} />
        <div className={styles["kanban-card-name"]}>
          {card.name}
          <span>{card.note}</span>
        </div>
      </div>
      <Badge variant={card.status === "unscored" ? "neutral" : card.status} icon={card.status !== "unscored" ? STATUS_ICON[card.status] : undefined}>
        {card.statusLabel}
      </Badge>
    </div>
  );
}