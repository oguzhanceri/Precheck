import type { MetricItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function MetricCard({ item }: { item: MetricItem }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-5">
        <p className="max-w-40 text-sm leading-5 text-white/60">{item.label}</p>
        {item.tone ? <Badge tone={item.tone}>{item.change ?? "Aktif"}</Badge> : null}
      </div>
      <strong className="mt-8 block text-4xl font-semibold tracking-[-0.06em] text-white">
        {item.value}
      </strong>
    </Card>
  );
}
