export type FileUploadStatus = "done" | "processing" | "error";

export interface FileUploadItem {
  id: string;
  name: string;
  sizeLabel: string;
  status: FileUploadStatus;
  note?: string;
  errorMessage?: string;
  progress?: number;
}