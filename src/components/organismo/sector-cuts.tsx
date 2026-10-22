import Link from "next/link";
import type { SectorCut } from "@/lib/organismo/sector-cuts";

export function SectorCuts({
  orgSlug,
  cuts,
  active,
}: {
  orgSlug: string;
  cuts: SectorCut[];
  active?: string;
}) {
  if (cuts.length === 0) return null;
  return (
    <section className="grid gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-h3 text-ink">Por sector</h2>
        {active ? (
          <Link href={`/${orgSlug}`} className="text-small font-semibold text-link">
            Ver todos
          </Link>
        ) : null}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-left">
          <thead className="text-micro uppercase text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Sector</th>
              <th className="px-4 py-3 font-medium">Aperturas</th>
              <th className="px-4 py-3 font-medium">Conversiones</th>
              <th className="px-4 py-3 font-medium">Tasa</th>
            </tr>
          </thead>
          <tbody>
            {cuts.map((cut) => (
              <tr key={cut.slug} className={cut.slug === active ? "bg-surface-subtle" : undefined}>
                <td className="border-t border-line px-4 py-3">
                  <Link href={`/${orgSlug}?corte=${cut.slug}`} className="font-semibold text-ink">
                    {cut.name}
                  </Link>
                </td>
                <td className="border-t border-line px-4 py-3 tabular-nums text-ink">{cut.opens}</td>
                <td className="border-t border-line px-4 py-3 tabular-nums text-ink">{cut.conversions}</td>
                <td className="border-t border-line px-4 py-3 tabular-nums text-ink">{cut.rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
