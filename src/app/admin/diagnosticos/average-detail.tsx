import { instrumentLabel } from "./instrument-label";

const BANDS = [
  { id: "bronce", label: "Bronce", color: "var(--medal-bronce)" },
  { id: "plata", label: "Plata", color: "var(--medal-plata)" },
  { id: "oro", label: "Oro", color: "var(--medal-oro)" },
  { id: "platino", label: "Platino", color: "var(--medal-platino)" },
] as const;

export function AverageDetail({
  bands,
  rows,
}: {
  bands: Record<string, number>;
  rows: { instrumentId: string; average: number; finished: number }[];
}) {
  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {BANDS.map((band) => (
          <article key={band.id} className="rounded-2xl border border-line px-3 py-3">
            <p className="flex items-center gap-2 text-sm text-ink-secondary">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: band.color }} />
              {band.label}
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{bands[band.id] ?? 0}</p>
          </article>
        ))}
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.instrumentId}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <p className="text-ink">{instrumentLabel(row.instrumentId)}</p>
              <p className="tabular-nums text-ink-secondary">
                {row.average} · {row.finished}
              </p>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(0, Math.min(100, row.average))}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
