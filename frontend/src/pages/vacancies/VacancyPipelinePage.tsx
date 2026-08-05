import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/icons/Icon";
import { Kanban } from "@/components/vacancies/Kanban";
import { usePageTitle } from "@/context/PageTitleContext";
import { fetchPipeline, fetchVacancy } from "@/lib/vacanciesApi";
import { PATHS } from "@/router/paths";
import type { PipelineStage, Vacancy } from "@/types/vacancy";

export function VacancyPipelinePage() {
  const { id } = useParams<{ id: string }>();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [stages, setStages] = useState<PipelineStage[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  usePageTitle(vacancy?.title ?? "Вакансия");

  useEffect(() => {
    if (!id) return;
    setError(null);
    Promise.all([fetchVacancy(id), fetchPipeline(id)])
      .then(([v, p]) => {
        setVacancy(v);
        setStages(p);
      })
      .catch(() => setError("Не удалось загрузить вакансию"));
  }, [id]);

  return (
    <>
      <BackLink to={PATHS.vacancies} label="Вакансии" />

      {error && <Card padded>{error}</Card>}

      {!error && !vacancy && <Card padded>Загрузка…</Card>}

      {!error && vacancy && (
        <>
          <PageHeader
            title={vacancy.title}
            subtitle={`${vacancy.department} · ${vacancy.openedLabel} · ответственный: ${vacancy.owner} · ${vacancy.inPipeline} кандидатов`}
            action={
              <Button>
                <Icon name="settings" />
                Требования вакансии
              </Button>
            }
          />
          {stages && <Kanban stages={stages} />}
        </>
      )}
    </>
  );
}
