import { Badge } from "@/components/ui/Badge";
import { STATUS_ICON, STATUS_LABEL, computeStatus } from "@/lib/status";

export function StatusBadge({ score, threshold }: { score: number; threshold: number }) {
  const status = computeStatus(score, threshold);
  return (
    <Badge variant={status} icon={STATUS_ICON[status]}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}