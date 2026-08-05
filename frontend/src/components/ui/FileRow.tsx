import type { FileUploadItem } from "@/types/upload";
import { Icon } from "@/components/icons/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import styles from "@/components/ui/FileRow.module.css";

const ICON: Record<FileUploadItem["status"], "check-circle" | "x-circle" | "cpu"> = {
  done: "check-circle",
  error: "x-circle",
  processing: "cpu",
};

export function FileRow({ file }: { file: FileUploadItem }) {
  const iconClass = file.status === "done" ? styles.ok : file.status === "error" ? styles.err : undefined;

  return (
    <div className={styles["file-row"]}>
      <div
        className={`${styles["file-icon"]}${iconClass ? ` ${iconClass}` : ""}`}
        style={file.status === "processing" ? { color: "var(--accent)", background: "var(--accent-soft)" } : undefined}
      >
        <Icon name={ICON[file.status]} />
      </div>
      <div className={styles["file-meta"]}>
        <span className={styles["file-name"]}>{file.name}</span>
        {file.status === "error" ? (
          <span className={`${styles["file-sub"]} ${styles.err}`}>{file.errorMessage}</span>
        ) : (
          <span className={styles["file-sub"]}>
            {file.sizeLabel} · {file.note}
          </span>
        )}
        {file.status === "processing" && file.progress !== undefined && (
          <ProgressBar percent={file.progress} style={{ marginTop: ".2rem" }} />
        )}
      </div>
    </div>
  );
}