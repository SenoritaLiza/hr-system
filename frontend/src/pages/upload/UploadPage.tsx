import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Dropzone } from "@/components/ui/Dropzone";
import { Segmented } from "@/components/ui/Segmented";
import { Field, FormRow, Input, Select, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Icon } from "@/components/icons/Icon";
import { usePageTitle } from "@/context/PageTitleContext";
import { useVacancies } from "@/context/VacanciesContext";
import { useThreshold } from "@/context/ThresholdContext";
import { computeStatus, STATUS_ICON, STATUS_LABEL } from "@/lib/status";
import { createCandidate, type CreateCandidateInput } from "@/lib/candidatesApi";
import { vacancyPipelinePath } from "@/router/paths";
import type { CandidateScreeningResult } from "@/types/screening";

type InputMode = "structured" | "free";

export function UploadPage() {
  usePageTitle("Загрузить резюме");
  const { vacancies } = useVacancies();
  const [vacancyId, setVacancyId] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<InputMode>("structured");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CandidateScreeningResult | null>(null);

  const structured = useStructuredForm();
  const free = useFreeTextForm();

  const submit = () => {
    if (!vacancyId) {
      setError("Выберите вакансию");
      return;
    }
    if (!name.trim()) {
      setError("Укажите имя кандидата");
      return;
    }

    let input: CreateCandidateInput;
    if (file) {
      input = { name, file };
    } else if (mode === "structured") {
      input = {
        name,
        position: structured.position,
        experienceText: structured.experience,
        skills: structured.skills,
        education: `${structured.eduLevel} computer science; ${structured.eduYear} graduation`,
        totalExperience: structured.totalExperience,
        lastPosition: structured.lastPosition,
      };
    } else {
      input = {
        name,
        experienceText: free.text,
        education: free.text,
        totalExperience: free.totalExperience,
        lastPosition: free.lastPosition,
      };
    }

    setError(null);
    setSubmitting(true);
    createCandidate(vacancyId, input)
      .then(setResult)
      .catch(() => setError("Не удалось оценить кандидата"))
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <PageHeader title="Новая оценка кандидата" subtitle="Загрузите файл резюме или заполните данные вручную" />

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
            <Field label="Имя кандидата">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван Петров" />
            </Field>
          </Card>

          <Card padded>
            <Dropzone
              title={file ? file.name : "Перетащите файл резюме сюда"}
              subtitle={file ? "Файл выбран — нажмите, чтобы заменить" : "или нажмите, чтобы выбрать файл"}
              formats="PDF, DOCX — до 10 МБ"
              onFilesSelected={(files) => setFile(files[0] ?? null)}
            />
            {file && (
              <Button onClick={() => setFile(null)} style={{ marginTop: ".8rem" }}>
                Убрать файл, ввести вручную
              </Button>
            )}
          </Card>

          {!file && (
            <Card>
              <CardHeader
                title="Способ ввода"
                action={
                  <Segmented
                    value={mode}
                    onChange={setMode}
                    options={[
                      { value: "structured", label: "Структурированный" },
                      { value: "free", label: "Свободный текст" },
                    ]}
                  />
                }
              />
              <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {mode === "structured" ? <StructuredForm form={structured} /> : <FreeTextForm form={free} />}
              </div>
            </Card>
          )}

          {error && <Card padded>{error}</Card>}

          <Button variant="primary" block onClick={submit} disabled={submitting}>
            <Icon name="search" />
            {submitting ? "Оцениваем…" : "Оценить кандидата"}
          </Button>
        </div>

        <Card padded>
          <h2 style={{ marginBottom: "1rem", fontSize: ".98rem" }}>Результат оценки</h2>
          {result ? <ResultPanel result={result} vacancyId={vacancyId} /> : <p>Заполните форму слева и нажмите «Оценить кандидата».</p>}
        </Card>
      </div>
    </>
  );
}

function ResultPanel({ result, vacancyId }: { result: CandidateScreeningResult; vacancyId: string }) {
  const navigate = useNavigate();
  const { threshold } = useThreshold();
  const status = computeStatus(result.score, threshold);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Badge variant={status} icon={STATUS_ICON[status]}>
        {STATUS_LABEL[status]}
      </Badge>
      <div>
        <strong style={{ fontSize: "1.4rem" }}>{result.score}%</strong>
        <ProgressBar percent={result.score} style={{ marginTop: ".4rem" }} />
      </div>

      <div>
        <h3 style={{ fontSize: ".85rem", marginBottom: ".4rem" }}>Оценки моделей</h3>
        <p style={{ fontSize: ".85rem", color: "var(--ink-muted)" }}>
          LR: {Math.round(result.lrProba * 100)}% · RF: {Math.round(result.rfProba * 100)}% · CatBoost:{" "}
          {Math.round(result.catProba * 100)}%
        </p>
      </div>

      {result.positiveFactors.length > 0 && (
        <div>
          <h3 style={{ fontSize: ".85rem", marginBottom: ".4rem" }}>Факторы «за»</h3>
          {result.positiveFactors.map((f) => (
            <p key={f.label} style={{ fontSize: ".82rem" }}>
              {f.label} (+{f.weight.toFixed(3)})
            </p>
          ))}
        </div>
      )}

      {result.negativeFactors.length > 0 && (
        <div>
          <h3 style={{ fontSize: ".85rem", marginBottom: ".4rem" }}>Факторы «против»</h3>
          {result.negativeFactors.map((f) => (
            <p key={f.label} style={{ fontSize: ".82rem" }}>
              {f.label} ({f.weight.toFixed(3)})
            </p>
          ))}
        </div>
      )}

      <Button onClick={() => navigate(vacancyPipelinePath(vacancyId))}>
        Перейти в пайплайн вакансии
      </Button>
    </div>
  );
}

function useStructuredForm() {
  const [position, setPosition] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [eduLevel, setEduLevel] = useState("master");
  const [eduYear, setEduYear] = useState(2020);
  const [totalExperience, setTotalExperience] = useState(0);
  const [lastPosition, setLastPosition] = useState("");
  return {
    position, setPosition,
    experience, setExperience,
    skills, setSkills,
    eduLevel, setEduLevel,
    eduYear, setEduYear,
    totalExperience, setTotalExperience,
    lastPosition, setLastPosition,
  };
}

type StructuredFormState = ReturnType<typeof useStructuredForm>;

function StructuredForm({ form }: { form: StructuredFormState }) {
  return (
    <>
      <Field label="Желаемая должность">
        <Input value={form.position} onChange={(e) => form.setPosition(e.target.value)} placeholder="Senior Python Developer" />
      </Field>
      <FormRow>
        <Field label="Образование">
          <Select value={form.eduLevel} onChange={(e) => form.setEduLevel(e.target.value)}>
            <option value="master">Магистр</option>
            <option value="bachelor">Бакалавр</option>
            <option value="phd">PhD</option>
            <option value="college">Среднее</option>
          </Select>
        </Field>
        <Field label="Год выпуска">
          <Input type="number" value={form.eduYear} onChange={(e) => form.setEduYear(Number(e.target.value))} />
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Опыт (лет)">
          <Input
            type="number"
            value={form.totalExperience}
            onChange={(e) => form.setTotalExperience(Number(e.target.value))}
          />
        </Field>
        <Field label="Последняя должность">
          <Input value={form.lastPosition} onChange={(e) => form.setLastPosition(e.target.value)} placeholder="Python Developer, Wildberries" />
        </Field>
      </FormRow>
      <Field label="Описание опыта">
        <Textarea value={form.experience} onChange={(e) => form.setExperience(e.target.value)} />
      </Field>
      <Field label="Навыки (через запятую)">
        <Input value={form.skills} onChange={(e) => form.setSkills(e.target.value)} placeholder="python, django, postgresql, docker, git, redis" />
      </Field>
    </>
  );
}

function useFreeTextForm() {
  const [text, setText] = useState("");
  const [totalExperience, setTotalExperience] = useState(0);
  const [lastPosition, setLastPosition] = useState("");
  return { text, setText, totalExperience, setTotalExperience, lastPosition, setLastPosition };
}

type FreeTextFormState = ReturnType<typeof useFreeTextForm>;

function FreeTextForm({ form }: { form: FreeTextFormState }) {
  return (
    <>
      <Field label="Вставьте резюме целиком">
        <Textarea
          style={{ minHeight: 200 }}
          placeholder="Python Developer. 5 years experience with Django, Docker, PostgreSQL. Master degree in Computer Science (2019). Skills: python, docker, sql, git…"
          value={form.text}
          onChange={(e) => form.setText(e.target.value)}
        />
      </Field>
      <FormRow>
        <Field label="Годы опыта (если известно)">
          <Input
            type="number"
            value={form.totalExperience}
            onChange={(e) => form.setTotalExperience(Number(e.target.value))}
          />
        </Field>
        <Field label="Последняя должность (если известно)">
          <Input value={form.lastPosition} onChange={(e) => form.setLastPosition(e.target.value)} />
        </Field>
      </FormRow>
    </>
  );
}
