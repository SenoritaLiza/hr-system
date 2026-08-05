import { useState, type DragEvent } from "react";
import { Icon } from "@/components/icons/Icon";
import styles from "@/components/ui/Dropzone.module.css";

interface DropzoneProps {
  title: string;
  subtitle?: string;
  formats: string;
  compact?: boolean;
}

export function Dropzone({ title, subtitle, formats, compact }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e: DragEvent, dragging: boolean) => {
    e.preventDefault();
    setIsDragging(dragging);
  };

  return (
    <div
      className={`${styles.dropzone}${isDragging ? ` ${styles.drag}` : ""}`}
      style={compact ? { padding: "1.6rem 1.5rem" } : undefined}
      onDragOver={(e) => handleDrag(e, true)}
      onDragLeave={(e) => handleDrag(e, false)}
      onDrop={(e) => handleDrag(e, false)}
    >
      <div className={styles["dz-icon"]}>
        <Icon name="upload" />
      </div>
      <strong>{title}</strong>
      {subtitle && <span>{subtitle}</span>}
      <span className={styles["dz-formats"]}>{formats}</span>
    </div>
  );
}