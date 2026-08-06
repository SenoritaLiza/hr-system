import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, FormRow, Input } from "@/components/ui/FormField";
import { Icon } from "@/components/icons/Icon";
import { VacancyCard } from "@/components/vacancies/VacancyCard";
import { usePageTitle } from "@/context/PageTitleContext";
import { useVacancies } from "@/context/VacanciesContext";
import { useCurrentPersona } from "@/context/RoleContext";
import { createVacancy } from "@/lib/vacanciesApi";
import type { Vacancy } from "@/types/vacancy";

export function VacanciesPage() {
  usePageTitle("Вакансии");
  const { vacancies, error, addVacancy } = useVacancies();
  const [formOpen, setFormOpen] = useState(false);

  const openCount = vacancies?.filter((v) => v.status !== "closed").length ?? 0;

  return (
    <>
      <PageHeader
        title="Вакансии"
        subtitle={vacancies ? `${openCount} открытых позиции из ${vacancies.length}` : "Загрузка…"}
        action={
          <Button variant="primary" onClick={() => setFormOpen((v) => !v)}>
            <Icon name="plus" />
            Создать вакансию
          </Button>
        }
      />

      {formOpen && (
        <Card padded style={{ marginBottom: "1rem" }}>
          <NewVacancyForm
            onCreated={(vacancy) => {
              addVacancy(vacancy);
              setFormOpen(false);
            }}
          />
        </Card>
      )}

      {error && <Card padded>{error}</Card>}

      {!error && vacancies === null && <Card padded>Загрузка…</Card>}

      {!error && vacancies !== null && vacancies.length === 0 && (
        <Card padded>Пока нет ни одной вакансии — создайте первую</Card>
      )}

      {!error && vacancies !== null && vacancies.length > 0 && (
        <Card>
          {vacancies.map((v) => (
            <VacancyCard key={v.id} vacancy={v} />
          ))}
        </Card>
      )}
    </>
  );
}

function NewVacancyForm({ onCreated }: { onCreated: (v: Vacancy) => void }) {
  const persona = useCurrentPersona();
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [owner, setOwner] = useState(persona.name);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!title.trim() || !department.trim() || !owner.trim()) {
      setError("Заполните все поля");
      return;
    }
    setSubmitting(true);
    setError(null);
    createVacancy({ title, department, owner })
      .then(onCreated)
      .catch(() => setError("Не удалось создать вакансию"))
      .finally(() => setSubmitting(false));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <FormRow>
        <Field label="Название вакансии">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior Python Developer" />
        </Field>
        <Field label="Отдел">
          <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Backend" />
        </Field>
      </FormRow>
      <Field label="Ответственный">
        <Input value={owner} onChange={(e) => setOwner(e.target.value)} />
      </Field>
      {error && <span style={{ color: "var(--critical-ink)", fontSize: ".85rem" }}>{error}</span>}
      <Button variant="primary" onClick={submit} disabled={submitting} style={{ alignSelf: "flex-start" }}>
        {submitting ? "Создаём…" : "Создать"}
      </Button>
    </div>
  );
}