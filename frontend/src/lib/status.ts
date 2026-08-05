import type { CandidateStatus } from "@/types/common";
import type { IconName } from "@/components/icons/Icon";

// Кандидаты в диапазоне [threshold-15, threshold) считаются пограничными 
const WARNING_BAND = 15;

export function computeStatus(score: number, threshold: number): CandidateStatus {
  if (score >= threshold) return "good";
  if (score >= threshold - WARNING_BAND) return "warning";
  return "critical";
}

export const STATUS_LABEL: Record<CandidateStatus, string> = {
  good: "Рекомендован",
  warning: "Пограничный",
  critical: "Не рекомендован",
};

export const STATUS_ICON: Record<CandidateStatus, IconName> = {
  good: "check-circle",
  warning: "alert-triangle",
  critical: "x-circle",
};