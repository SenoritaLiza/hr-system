import type { Candidate } from "@/types/candidate";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CompareTable } from "@/components/candidates/CompareTable";
import { usePageTitle } from "@/context/PageTitleContext";
import { useThreshold } from "@/context/ThresholdContext";
import { PATHS } from "@/router/paths";

export function ComparePage() {
  usePageTitle("Сравнение кандидатов");
  const { threshold } = useThreshold();
  // Избранное пока не реализовано 
  const favorites: Candidate[] = [];

  return (
    <>
      <BackLink to={PATHS.candidates} label="Все кандидаты" />
      <PageHeader title="Сравнение кандидатов" subtitle={`${favorites.length} избранных кандидата`} />
      {favorites.length > 0 ? (
        <CompareTable candidates={favorites} threshold={threshold} />
      ) : (
        <Card>
          <EmptyState
            icon="star"
            title="Нечего сравнивать"
            description="Отметьте кандидатов звёздочкой в списке, чтобы сравнить их здесь"
          />
        </Card>
      )}
    </>
  );
}