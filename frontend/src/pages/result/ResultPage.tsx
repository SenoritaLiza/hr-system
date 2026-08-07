import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { ChipRow, Chip } from "@/components/ui/Chip";
import { KvRow } from "@/components/ui/KvRow";
import { FavoriteButton } from "@/components/candidates/FavoriteButton";
import { VerdictBanner } from "@/components/result/VerdictBanner";
import { GaugeChart } from "@/components/charts/GaugeChart";
import { FactorList } from "@/components/result/FactorList";
import { usePageTitle } from "@/context/PageTitleContext";
import { useThreshold } from "@/context/ThresholdContext";
import { fetchCandidate } from "@/lib/candidatesApi";
import { PATHS } from "@/router/paths";
import type { CandidateDetail } from "@/types/screening";

export function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const { threshold } = useThreshold();
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  usePageTitle(candidate?.name ?? "Кандидат");

  useEffect(() => {
    if (!id) return;
    setError(null);
    setCandidate(null);
    fetchCandidate(id)
      .then(setCandidate)
      .catch(() => setError("Не удалось загрузить кандидата"));
  }, [id]);

  if (error) {
    return (
      <>
        <BackLink to={PATHS.vacancies} label="Вакансии" />
        <Card padded>{error}</Card>
      </>
    );
  }

  if (!candidate) {
    return (
      <>
        <BackLink to={PATHS.vacancies} label="Вакансии" />
        <Card padded>Загрузка…</Card>
      </>
    );
  }

  return (
    <>
      <BackLink to={PATHS.vacancies} label="Вакансии" />
      <PageHeader
        title={candidate.name}
        subtitle={`${candidate.vacancyTitle} · ${candidate.totalExperience} года опыта`}
        action={
          <div style={{ display: "flex", gap: ".6rem" }}>
            <FavoriteButton active={false} onToggle={() => {}} disabled />
            <Button disabled title="Скоро">
              Пригласить на интервью
            </Button>
          </div>
        }
      />

      <div className="detail-grid">
        <div className="stack">
          <Card padded style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: ".4rem" }}>
            <div style={{ width: "100%", marginBottom: ".6rem" }}>
              <VerdictBanner score={candidate.score} threshold={threshold} />
            </div>
            <GaugeChart score={candidate.score} threshold={threshold} />
            <div style={{ display: "flex", gap: "1.1rem", marginTop: ".5rem", fontFamily: "var(--font-mono)", fontSize: ".8rem", color: "var(--ink-2)" }}>
              <span>LR {candidate.lrProba.toFixed(2)}</span>
              <span>RF {candidate.rfProba.toFixed(2)}</span>
              <span>CatBoost {candidate.catProba.toFixed(2)}</span>
            </div>
          </Card>

          <Card>
            <CardHeader title="NER — извлечённые сущности" />
            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: ".9rem" }}>
              <KvRow label="Уровень должности" value={candidate.seniorityLabel} />
              <KvRow label="Образование" value={candidate.educationLabel} />
              <KvRow label="Стаж" value={`${candidate.totalExperience} года`} />
              <div>
                <div style={{ fontSize: ".85rem", color: "var(--ink-muted)", marginBottom: ".4rem" }}>
                  Технические навыки ({candidate.techSkills.length})
                </div>
                <ChipRow>
                  {candidate.techSkills.length > 0 ? (
                    candidate.techSkills.map((s) => <Chip key={s}>{s}</Chip>)
                  ) : (
                    <span style={{ color: "var(--ink-muted)", fontSize: ".85rem" }}>—</span>
                  )}
                </ChipRow>
              </div>
              <div>
                <div style={{ fontSize: ".85rem", color: "var(--ink-muted)", marginBottom: ".4rem" }}>
                  Soft skills ({candidate.softSkills.length})
                </div>
                <ChipRow>
                  {candidate.softSkills.length > 0 ? (
                    candidate.softSkills.map((s) => <Chip key={s}>{s}</Chip>)
                  ) : (
                    <span style={{ color: "var(--ink-muted)", fontSize: ".85rem" }}>—</span>
                  )}
                </ChipRow>
              </div>
            </div>
          </Card>
        </div>

        <div className="stack">
          {/*
            TODO: реальная LLM-интеграция ("скрытые признаки" — связность карьеры,
            соответствие грейду итд). Нужен вызов LLM API + промпт-инжиниринг —
            отдельная фича
          */}
          <Card>
            <CardHeader title="LLM — скрытые признаки" hint="скоро" />
            <div style={{ padding: "1.25rem", color: "var(--ink-muted)", fontSize: ".85rem" }}>
              Анализ связности карьеры, соответствия грейду и red flags через LLM пока не подключён.
            </div>
          </Card>

          <Card>
            <CardHeader title="Объяснение решения" />
            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              <div>
                <div style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--good-ink)", marginBottom: ".55rem" }}>
                  Факторы «за»
                </div>
                {candidate.positiveFactors.length > 0 ? (
                  <FactorList factors={candidate.positiveFactors} sign="pos" />
                ) : (
                  <span style={{ fontSize: ".85rem", color: "var(--ink-muted)" }}>Нет значимых факторов</span>
                )}
              </div>
              <div>
                <div style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--critical-ink)", marginBottom: ".55rem" }}>
                  Факторы «против»
                </div>
                {candidate.negativeFactors.length > 0 ? (
                  <FactorList factors={candidate.negativeFactors} sign="neg" />
                ) : (
                  <span style={{ fontSize: ".85rem", color: "var(--ink-muted)" }}>Нет значимых факторов</span>
                )}
              </div>
            </div>
          </Card>

          <Card padded>
            <div style={{ fontSize: ".85rem", fontWeight: 600, marginBottom: ".7rem" }}>Обратная связь HR</div>
            <div style={{ display: "flex", gap: ".6rem" }}>
              <Button size="sm" disabled title="Скоро">
                <Icon name="check-circle" />
                Верно
              </Button>
              <Button size="sm" disabled title="Скоро">
                <Icon name="x-circle" />
                Неверно
              </Button>
              <Button size="sm" disabled title="Скоро">
                <Icon name="alert-triangle" />
                Не уверен
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}