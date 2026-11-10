import Link from "next/link";
import type { SectorCut } from "@/lib/organismo/sector-cuts";
import type { SectorSeat } from "@/lib/organismo/load-sector-seats";

export function SectorCuts({
  orgSlug,
  cuts,
  active,
  seats = {},
}: {
  orgSlug: string;
  cuts: SectorCut[];
  active?: string;
  seats?: Record<string, SectorSeat | null>;
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
              <th className="px-4 py-3 font-medium">Lugares</th>
              <th className="px-4 py-3 font-medium">Confirmados</th>
              <th className="px-4 py-3 font-medium">Disponibles</th>
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
                <td className="border-t border-line px-4 py-3 tabular-nums text-ink">{lugares(seats[cut.slug])}</td>
                <td className="border-t border-line px-4 py-3 tabular-nums text-ink">{confirmados(seats[cut.slug])}</td>
                <td className="border-t border-line px-4 py-3 tabular-nums text-ink">{disponibles(seats[cut.slug])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function lugares(seat: SectorSeat | null | undefined) {
  if (!seat) return "—";
  if (seat.capacity === null) return "Sin cupo";
  return String(seat.capacity);
}

function confirmados(seat: SectorSeat | null | undefined) {
  if (!seat) return "—";
  return String(seat.filled);
}

function disponibles(seat: SectorSeat | null | undefined) {
  if (!seat || seat.capacity === null) return "—";
  return String(Math.max(seat.capacity - seat.filled, 0));
}
