import { useRef, useState, type DragEvent } from "react";
import { Icon } from "@/components/icons/Icon";
import styles from "@/components/ui/Dropzone.module.css";

interface DropzoneProps {
  title: string;
  subtitle?: string;
  formats: string;
  compact?: boolean;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
}

const ACCEPT = ".pdf,.docx";

export function Dropzone({ title, subtitle, formats, compact, multiple, onFilesSelected }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent, dragging: boolean) => {
    e.preventDefault();
    setIsDragging(dragging);
  };

  const handleDrop = (e: DragEvent) => {
    handleDrag(e, false);
    onFilesSelected(Array.from(e.dataTransfer.files));
  };

  return (
    <div
      className={`${styles.dropzone}${isDragging ? ` ${styles.drag}` : ""}`}
      style={{ cursor: "pointer", ...(compact ? { padding: "1.6rem 1.5rem" } : {}) }}
      onDragOver={(e) => handleDrag(e, true)}
      onDragLeave={(e) => handleDrag(e, false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        hidden
        onChange={(e) => onFilesSelected(Array.from(e.target.files ?? []))}
      />
      <div className={styles["dz-icon"]}>
        <Icon name="upload" />
      </div>
      <strong>{title}</strong>
      {subtitle && <span>{subtitle}</span>}
      <span className={styles["dz-formats"]}>{formats}</span>
    </div>
  );
}
