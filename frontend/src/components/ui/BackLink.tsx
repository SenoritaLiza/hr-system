import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/icons/Icon";
import styles from "@/components/ui/BackLink.module.css";

export function BackLink({ to, label }: { to: string; label: string }) {
  const navigate = useNavigate();
  return (
    <button type="button" className={styles["back-link"]} onClick={() => navigate(to)}>
      <Icon name="arrow-left" />
      {label}
    </button>
  );
}