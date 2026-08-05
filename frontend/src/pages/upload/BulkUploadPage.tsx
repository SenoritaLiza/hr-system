import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Dropzone } from "@/components/ui/Dropzone";
import { Badge } from "@/components/ui/Badge";
import { FileRow } from "@/components/ui/FileRow";
import { usePageTitle } from "@/context/PageTitleContext";
import { bulkUploadQueue } from "@/data/uploadQueue";

export function BulkUploadPage() {
  usePageTitle("Пакетная загрузка");
  const done = bulkUploadQueue.filter((f) => f.status === "done").length;
  const processing = bulkUploadQueue.filter((f) => f.status === "processing").length;
  const errors = bulkUploadQueue.filter((f) => f.status === "error").length;

  return (
    <>
      <PageHeader title="Пакетная загрузка резюме" subtitle="12 файлов из папки «Отклики_HH_04.08»" />
      <div className="grid grid-2">
        <div className="stack">
          <Card padded>
            <Dropzone title="Перетащите несколько файлов" formats="PDF, DOCX — до 50 файлов за раз" compact />
          </Card>
          <Card padded style={{ display: "flex", flexDirection: "row", gap: ".6rem", flexWrap: "wrap" }}>
            <Badge variant="good" icon="check-circle">
              {done} готово
            </Badge>
            <Badge variant="neutral">{processing} в обработке</Badge>
            <Badge variant="critical" icon="x-circle">
              {errors} ошибки
            </Badge>
            <Badge variant="neutral">1 в очереди</Badge>
          </Card>
        </div>
        <Card>
          <CardHeader title={`Файлы (${bulkUploadQueue.length + 4})`} hint="Отклики_HH_04.08" />
          <div style={{ padding: "1.25rem", paddingTop: ".3rem" }}>
            {bulkUploadQueue.map((file) => (
              <FileRow key={file.id} file={file} />
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}