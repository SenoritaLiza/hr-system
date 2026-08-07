import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Dropzone } from "@/components/ui/Dropzone";
import { Badge } from "@/components/ui/Badge";
import { FileRow } from "@/components/ui/FileRow";
import { Field, Select } from "@/components/ui/FormField";
import { usePageTitle } from "@/context/PageTitleContext";
import { useVacancies } from "@/context/VacanciesContext";
import { createCandidatesBulk } from "@/lib/candidatesApi";
import type { FileUploadItem } from "@/types/upload";

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export function BulkUploadPage() {
  usePageTitle("Пакетная загрузка");
  const { vacancies } = useVacancies();
  const [vacancyId, setVacancyId] = useState("");
  const [queue, setQueue] = useState<FileUploadItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: File[]) => {
    if (!vacancyId) {
      setError("Сначала выберите вакансию");
      return;
    }
    if (files.length === 0) return;
    setError(null);

    const pending: FileUploadItem[] = files.map((f) => ({
      id: f.name,
      name: f.name,
      sizeLabel: formatFileSize(f.size),
      status: "processing",
    }));
    setQueue((prev) => [...pending, ...prev]);

    createCandidatesBulk(vacancyId, files)
      .then((results) => {
        setQueue((prev) =>
          prev.map((item) => {
            const result = results.find((r) => r.filename === item.name);
            if (!result) return item;
            return result.status === "done"
              ? { ...item, status: "done", note: `распознан, score ${result.candidate?.score}%` }
              : { ...item, status: "error", errorMessage: result.errorMessage ?? "Не удалось обработать файл" };
          }),
        );
      })
      .catch(() => {
        setQueue((prev) =>
          prev.map((item) =>
            pending.some((p) => p.id === item.id) ? { ...item, status: "error", errorMessage: "Ошибка загрузки" } : item,
          ),
        );
      });
  };

  const done = queue.filter((f) => f.status === "done").length;
  const processing = queue.filter((f) => f.status === "processing").length;
  const errors = queue.filter((f) => f.status === "error").length;

  return (
    <>
      <PageHeader title="Пакетная загрузка резюме" subtitle="Загрузите сразу несколько файлов для одной вакансии" />
      <div className="grid grid-2">
        <div className="stack">
          <Card padded>
            <Field label="Вакансия">
              <Select value={vacancyId} onChange={(e) => setVacancyId(e.target.value)}>
                <option value="">Выберите вакансию…</option>
                {vacancies?.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title}
                  </option>
                ))}
              </Select>
            </Field>
          </Card>
          <Card padded>
            <Dropzone
              title="Перетащите несколько файлов"
              formats="PDF, DOCX — до 50 файлов за раз"
              compact
              multiple
              onFilesSelected={handleFiles}
            />
          </Card>
          {error && <Card padded>{error}</Card>}
          <Card padded style={{ display: "flex", flexDirection: "row", gap: ".6rem", flexWrap: "wrap" }}>
            <Badge variant="good" icon="check-circle">
              {done} готово
            </Badge>
            <Badge variant="neutral">{processing} в обработке</Badge>
            <Badge variant="critical" icon="x-circle">
              {errors} ошибки
            </Badge>
          </Card>
        </div>
        <Card>
          <CardHeader title={`Файлы (${queue.length})`} />
          <div style={{ padding: "1.25rem", paddingTop: ".3rem" }}>
            {queue.length === 0 && <p>Файлы ещё не загружены</p>}
            {queue.map((file) => (
              <FileRow key={file.id} file={file} />
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
