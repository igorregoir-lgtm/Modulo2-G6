import { Badge } from "@/components/ui/badge";
import { TIER_LABELS } from "@/lib/labels";
import type { RiskTier } from "@/lib/types";

export function TierBadge({ tier }: { tier: RiskTier }) {
  return <Badge variant={tier}>{TIER_LABELS[tier]}</Badge>;
}
