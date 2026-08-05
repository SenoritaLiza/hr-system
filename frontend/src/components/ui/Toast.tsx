import { Icon } from "@/components/icons/Icon";
import styles from "@/components/ui/Toast.module.css";

export function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div className={`${styles.toast}${visible ? ` ${styles.show}` : ""}`} role="status" aria-live="polite">
      <Icon name="check-circle" />
      <span>{message}</span>
    </div>
  );
}