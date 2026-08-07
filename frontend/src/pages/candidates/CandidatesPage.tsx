import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/FormField";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableToolbar, type StatusFilter } from "@/components/candidates/TableToolbar";
import { CandidateTable } from "@/components/candidates/CandidateTable";
import { usePageTitle } from "@/context/PageTitleContext";
import { useThreshold } from "@/context/ThresholdContext";
import { useVacancies } from "@/context/VacanciesContext";
import { computeStatus } from "@/lib/status";
import { fetchCandidates } from "@/lib/candidatesApi";
import type { CandidateListItem } from "@/types/screening";

export function CandidatesPage() {
  usePageTitle("Все кандидаты");
  const { threshold } = useThreshold();
  const { vacancies } = useVacancies();
  const [vacancyId, setVacancyId] = useState("");
  const [candidates, setCandidates] = useState<CandidateListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    setError(null);
    fetchCandidates(vacancyId || undefined)
      .then(setCandidates)
      .catch(() => setError("Не удалось загрузить кандидатов"));
  }, [vacancyId]);

  const withStatus = useMemo(
    () => (candidates ?? []).map((c) => ({ candidate: c, status: computeStatus(c.score, threshold) })),
    [candidates, threshold],
  );

  const counts: Record<StatusFilter, number> = {
    all: candidates?.length ?? 0,
    good: withStatus.filter((c) => c.status === "good").length,
    warning: withStatus.filter((c) => c.status === "warning").length,
    critical: withStatus.filter((c) => c.status === "critical").length,
  };

  const filtered = withStatus
    .filter(({ status }) => filter === "all" || status === filter)
    .filter(({ candidate }) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        candidate.name.toLowerCase().includes(q) ||
        candidate.position.toLowerCase().includes(q) ||
        candidate.techSkills.some((s) => s.toLowerCase().includes(q))
      );
    })
    .map(({ candidate }) => candidate);

  return (
    <>
      <PageHeader
        title="Все кандидаты"
        subtitle={candidates ? `${candidates.length} резюме обработано` : "Загрузка…"}
      />
      <Card>
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          counts={counts}
          action={
            <Select value={vacancyId} onChange={(e) => setVacancyId(e.target.value)} style={{ width: 220 }}>
              <option value="">Все вакансии</option>
              {vacancies?.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title}
                </option>
              ))}
            </Select>
          }
        />
        {error && <div style={{ padding: "1.25rem" }}>{error}</div>}
        {!error && candidates === null && <div style={{ padding: "1.25rem" }}>Загрузка…</div>}
        {!error &&
          candidates !== null &&
          (filtered.length > 0 ? (
            <CandidateTable candidates={filtered} threshold={threshold} />
          ) : (
            <EmptyState
              icon="search"
              title="Ничего не найдено"
              description="Попробуйте изменить запрос или сбросить фильтры"
              action={
                <Button
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                    setVacancyId("");
                  }}
                >
                  Сбросить фильтры
                </Button>
              }
            />
          ))}
      </Card>
    </>
  );
}