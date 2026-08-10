import type { ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import type { CandidateStatus } from "@/types/common";
import { STATUS_LABEL } from "@/lib/status";
import styles from "@/components/candidates/TableToolbar.module.css";

export type StatusFilter = "all" | CandidateStatus;

interface TableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
  counts: Record<StatusFilter, number>;
  action?: ReactNode;
}

const FILTERS: StatusFilter[] = ["all", "good", "warning", "critical"];

export function TableToolbar({ search, onSearchChange, filter, onFilterChange, counts, action }: TableToolbarProps) {
  return (
    <div className={styles["table-toolbar"]}>
      <div className={styles["search-inline"]}>
        <Icon name="search" />
        <input
          placeholder="Имя, должность, навык…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      {FILTERS.map((f) => (
        <button
          key={f}
          type="button"
          className={`${styles["filter-chip"]}${filter === f ? ` ${styles.active}` : ""}`}
          onClick={() => onFilterChange(f)}
        >
          {f === "all" ? "Все" : STATUS_LABEL[f]} · {counts[f]}
        </button>
      ))}
      <div style={{ flex: 1 }} />
      {action}
    </div>
  );
}