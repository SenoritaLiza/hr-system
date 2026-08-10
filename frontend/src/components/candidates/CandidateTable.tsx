import { useNavigate } from "react-router-dom";
import type { CandidateListItem } from "@/types/screening";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/icons/Icon";
import { FavoriteButton } from "@/components/candidates/FavoriteButton";
import { StatusBadge } from "@/components/candidates/StatusBadge";
import { candidateResultPath } from "@/router/paths";
import styles from "@/components/candidates/CandidateTable.module.css";

interface CandidateTableProps {
  candidates: CandidateListItem[];
  threshold: number;
  onToggleFavorite: (id: string) => void;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
}

export function CandidateTable({ candidates, threshold, onToggleFavorite }: CandidateTableProps) {
  const navigate = useNavigate();

  return (
    <div className={styles["table-scroll"]}>
      <table className={styles["data-table"]}>
        <thead>
          <tr>
            <th />
            <th>Кандидат</th>
            <th>Вакансия</th>
            <th>Опыт</th>
            <th>Score</th>
            <th>Статус</th>
            <th>Дата</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c.id} onClick={() => navigate(candidateResultPath(c.id))} style={{ cursor: "pointer" }}>
              <td>
                <FavoriteButton active={c.favorite} onToggle={() => onToggleFavorite(c.id)} />
              </td>
              <td>
                <div className={styles["cand-name-cell"]}>
                  <Avatar initials={c.initials} />
                  <div className={styles["cand-meta"]}>
                    <strong>{c.name}</strong>
                    <span>{c.techSkills.slice(0, 3).join(", ") || c.softSkills.slice(0, 2).join(", ")}</span>
                  </div>
                </div>
              </td>
              <td>{c.vacancyTitle}</td>
              <td className="num">{c.totalExperience} г.</td>
              <td className={`${styles["score-cell"]} num`}>{c.score}%</td>
              <td>
                <StatusBadge score={c.score} threshold={threshold} />
              </td>
              <td style={{ color: "var(--ink-muted)", fontSize: ".8rem" }}>{formatDate(c.createdAt)}</td>
              <td>
                <Icon name="chevron-right" style={{ color: "var(--ink-muted)" }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}