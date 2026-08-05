import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Dropzone } from "@/components/ui/Dropzone";
import { Segmented } from "@/components/ui/Segmented";
import { Field, FormRow, Input, Select, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { StepList, type Step } from "@/components/ui/StepList";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Icon } from "@/components/icons/Icon";
import { usePageTitle } from "@/context/PageTitleContext";
import { candidateResultPath } from "@/router/paths";

type InputMode = "structured" | "free";

const STEPS: Step[] = [
  { icon: "check-circle", label: "Файл распознан, текст извлечён", state: "done" },
  { icon: "check-circle", label: "NER: навыки, стаж, образование, должность", state: "done" },
  { icon: "cpu", label: "LLM: скрытые признаки — связность, соответствие грейду", state: "active" },
  { icon: "chart", label: "Скоринг и объяснение решения", state: "pending" },
];

export function UploadPage() {
  usePageTitle("Загрузить резюме");
  const navigate = useNavigate();
  const [mode, setMode] = useState<InputMode>("structured");

  return (
    <>
      <PageHeader title="Новая оценка кандидата" subtitle="Загрузите файл резюме или заполните данные вручную" />

      <div className="grid grid-2">
        <div className="stack">
          <Card padded>
            <Dropzone
              title="Перетащите файл резюме сюда"
              subtitle="или нажмите, чтобы выбрать файл"
              formats="PDF, DOCX — до 10 МБ"
            />
          </Card>

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
              {mode === "structured" ? <StructuredForm /> : <FreeTextForm />}
              <Button variant="primary" block onClick={() => navigate(candidateResultPath("c1"))}>
                <Icon name="search" />
                Оценить кандидата
              </Button>
            </div>
          </Card>
        </div>

        <Card padded>
          <h2 style={{ marginBottom: "1rem", fontSize: ".98rem" }}>Как это работает</h2>
          <StepList steps={STEPS} />
          <ProgressBar percent={68} style={{ marginTop: "1.1rem" }} />
          <p style={{ marginTop: ".6rem", fontSize: ".78rem", color: "var(--ink-muted)" }}>
            Обычно занимает 2–3 секунды
          </p>
        </Card>
      </div>
    </>
  );
}

function StructuredForm() {
  const [position, setPosition] = useState("Senior Python Developer");
  const [experience, setExperience] = useState(
    "4 года коммерческой разработки на Python. Разрабатывал REST API на Django, оптимизировал запросы к PostgreSQL, внедрил CI/CD на GitHub Actions. Руководил командой из 3 разработчиков...",
  );
  const [skills, setSkills] = useState("python, django, postgresql, docker, git, redis");

  return (
    <>
      <Field label="Желаемая должность">
        <Input value={position} onChange={(e) => setPosition(e.target.value)} />
      </Field>
      <FormRow>
        <Field label="Образование">
          <Select defaultValue="master">
            <option value="master">Магистр</option>
            <option value="bachelor">Бакалавр</option>
            <option value="phd">PhD</option>
            <option value="college">Среднее</option>
          </Select>
        </Field>
        <Field label="Год выпуска">
          <Input type="number" defaultValue={2020} />
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Опыт (лет)">
          <Input type="number" defaultValue={4} />
        </Field>
        <Field label="Последняя должность">
          <Input defaultValue="Python Developer, Wildberries" />
        </Field>
      </FormRow>
      <Field label="Описание опыта">
        <Textarea value={experience} onChange={(e) => setExperience(e.target.value)} />
      </Field>
      <Field label="Навыки (через запятую)">
        <Input value={skills} onChange={(e) => setSkills(e.target.value)} />
      </Field>
    </>
  );
}

function FreeTextForm() {
  const [text, setText] = useState("");

  return (
    <>
      <Field label="Вставьте резюме целиком">
        <Textarea
          style={{ minHeight: 200 }}
          placeholder="Python Developer. 5 years experience with Django, Docker, PostgreSQL. Master degree in Computer Science (2019). Skills: python, docker, sql, git…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </Field>
      <FormRow>
        <Field label="Годы опыта (если известно)">
          <Input type="number" defaultValue={0} />
        </Field>
        <Field label="Последняя должность (если известно)">
          <Input />
        </Field>
      </FormRow>
    </>
  );
}