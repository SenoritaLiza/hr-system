import { Icon } from "@/components/icons/Icon";
import styles from "@/components/candidates/CandidateTable.module.css";

interface FavoriteButtonProps {
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function FavoriteButton({ active, onToggle, disabled }: FavoriteButtonProps) {
  return (
    <button
      type="button"
      className={`${styles["fav-toggle"]}${active ? ` ${styles["is-fav"]}` : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={disabled}
      title={disabled ? "Скоро" : undefined}
      aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
      aria-pressed={active}
    >
      <Icon name="star" />
    </button>
  );
}