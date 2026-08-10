import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { ChipRow, Chip } from "@/components/ui/Chip";
import { FavoriteButton } from "@/components/candidates/FavoriteButton";
import { StatusBadge } from "@/components/candidates/StatusBadge";
import { usePageTitle } from "@/context/PageTitleContext";
import { useThreshold } from "@/context/ThresholdContext";
import { useCandidates } from "@/context/CandidatesContext";
import { candidateResultPath } from "@/router/paths";

export function FavoritesPage() {
  usePageTitle("Избранное");
  const navigate = useNavigate();
  const { threshold } = useThreshold();
  const { candidates, toggleFavorite } = useCandidates();
  const favorites = candidates.filter((c) => c.favorite);

  return (
    <>
      <PageHeader title="Избранное" subtitle={`${favorites.length} кандидата отмечены для дальнейшего рассмотрения`} />
      {favorites.length === 0 ? (
        <Card>
          <EmptyState
            icon="star"
            title="Пока пусто"
            description="Отмечайте кандидатов звёздочкой в списке — они появятся здесь"
          />
        </Card>
      ) : (
        <div className="grid grid-3">
          {favorites.map((c) => (
            <Card key={c.id} padded>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: ".65rem", cursor: "pointer" }}
                  onClick={() => navigate(candidateResultPath(c.id))}
                >
                  <Avatar initials={c.initials} />
                  <div>
                    <strong style={{ display: "block", fontSize: ".87rem" }}>{c.name}</strong>
                    <span style={{ fontSize: ".76rem", color: "var(--ink-muted)" }}>{c.vacancyTitle}</span>
                  </div>
                </div>
                <FavoriteButton active onToggle={() => toggleFavorite(c.id)} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0.9rem 0" }}>
                <StatusBadge score={c.score} threshold={threshold} />
                <span className="num" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                  {c.score}%
                </span>
              </div>
              <ChipRow>
                {c.techSkills.slice(0, 3).map((s) => (
                  <Chip key={s}>{s}</Chip>
                ))}
              </ChipRow>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}