import { LinkCards } from "@/components/organismo/link-cards";
import { OpensChart } from "@/components/organismo/opens-chart";

type Stats = {
  opens: number;
  conversions: number;
  rate: number;
  bars: { dia: string; aperturas: number; conversiones: number }[];
};

export function ActivityTab({ stats, color }: { stats: Stats; color: string | null }) {
  return (
    <div className="grid gap-6">
      <LinkCards opens={stats.opens} conversions={stats.conversions} rate={stats.rate} />
      <OpensChart bars={stats.bars} color={color ?? undefined} />
    </div>
  );
}
