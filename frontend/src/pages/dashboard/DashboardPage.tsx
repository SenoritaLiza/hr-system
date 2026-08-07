import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/candidates/StatusBadge";
import { FunnelChart } from "@/components/charts/FunnelChart";
import { usePageTitle } from "@/context/PageTitleContext";
import { useThreshold } from "@/context/ThresholdContext";
import { useCandidates } from "@/context/CandidatesContext";
import { candidateResultPath, PATHS } from "@/router/paths";
import styles from "@/pages/dashboard/DashboardPage.module.css";

const FUNNEL_STAGES = [
  { label: "Загружено", value: 312, colorVar: "--funnel-1" },
  { label: "Обработано (NER + LLM)", value: 298, colorVar: "--funnel-2" },
  { label: "Прошли порог (≥65%)", value: 121, colorVar: "--funnel-3" },
  { label: "Приглашены HR", value: 96, colorVar: "--funnel-4" },
];

export function DashboardPage() {
  usePageTitle("Дашборд");
  const navigate = useNavigate();
  const { threshold } = useThreshold();
  const { candidates } = useCandidates();

  const recommended = candidates.filter((c) => c.score >= threshold).length;
  const avgScore = Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length);
  const recent = [...candidates].slice(0, 5);

  return (
    <>
      <PageHeader
        title="Доброе утро, Елизавета"
        subtitle="Вторник, 4 августа · за сегодня обработано 47 резюме"
        action={
          <Button variant="primary" onClick={() => navigate(PATHS.upload)}>
            <Icon name="upload" />
            Загрузить резюме
          </Button>
        }
      />

      <div className="grid grid-kpi" style={{ marginBottom: "1rem" }}>
        <KpiCard label="Обработано сегодня" value="47" icon="file" delta="+12% к вчера" trend="up" />
        <KpiCard
          label="Рекомендовано"
          value={recommended}
          icon="check-circle"
          delta={`${Math.round((recommended / candidates.length) * 100)}% от обработанных`}
        />
        <KpiCard label="Средний score" value={`${avgScore}%`} icon="chart" delta="−3% к вчера" trend="down" />
        <KpiCard
          label="Время обработки"
          value={
            <>
              2.3<span style={{ fontSize: "1rem", color: "var(--ink-muted)" }}> сек</span>
            </>
          }
          icon="clock"
          delta="NER + LLM в среднем"
        />
      </div>

      <div className="grid grid-2">
        <Card>
          <CardHeader title="Воронка обработки — сегодня" hint="312 загружено" />
          <div style={{ padding: "1.25rem" }}>
            <FunnelChart stages={FUNNEL_STAGES} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Последняя активность" hint="все кандидаты" />
          <div className={styles["recent-list"]}>
            {recent.map((c) => (
              <div
                key={c.id}
                className={styles["recent-row"]}
                onClick={() => navigate(candidateResultPath(c.id))}
              >
                <Avatar initials={c.initials} />
                <div className={styles["recent-meta"]}>
                  <strong>{c.name}</strong>
                  <span>{c.position}</span>
                </div>
                <StatusBadge score={c.score} threshold={threshold} />
                <span className={styles["recent-time"]}>{new Date(c.createdAt).toLocaleDateString("ru-RU")}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}