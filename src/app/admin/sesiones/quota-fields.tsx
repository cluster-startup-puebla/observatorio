"use client";

import { useQuotaTotal } from "@/app/admin/sesiones/use-quota-total";
import { foroPueblaQuotasBySlug } from "@/content/foro-puebla";

type Sector = { id: string; name: string; slug: string };

export function QuotaFields({
  sectors,
  quotas = {},
  capacityMax,
}: {
  sectors: Sector[];
  quotas?: Record<string, number>;
  capacityMax?: string;
}) {
  const { values, total, setCapacity, replaceAll } = useQuotaTotal(
    Object.fromEntries(sectors.map((sector) => [sector.id, quotas[sector.id] ?? 0])),
  );

  function applyForo() {
    const next: Record<string, number> = {};
    for (const sector of sectors) next[sector.id] = foroPueblaQuotasBySlug[sector.slug] ?? 0;
    replaceAll(next);
  }

  return (
    <fieldset className="grid gap-2 rounded-lg border border-line p-3">
      <legend className="px-1 text-small font-medium text-ink">Invitados por sector</legend>
      <button type="button" className="justify-self-start text-small text-link" onClick={applyForo}>
        Usar distribución del Foro Puebla x Puebla
      </button>
      <ul className="grid max-h-56 gap-2 overflow-y-auto">
        {sectors.map((sector) => (
          <li key={sector.id} className="grid grid-cols-[1fr_5rem] items-center gap-2 text-small">
            <label htmlFor={`quota-${sector.id}`}>{sector.name}</label>
            <input
              id={`quota-${sector.id}`}
              name={`quota.${sector.id}`}
              type="number"
              min={0}
              value={values[sector.id] || ""}
              onChange={(event) => setCapacity(sector.id, event.target.value)}
              className="rounded-lg border border-line px-2 py-1"
            />
          </li>
        ))}
      </ul>
      {total > 0 ? (
        <>
          <p className="text-small text-ink-muted">
            Total de invitados: <span className="font-medium text-ink">{total}</span>
          </p>
          <input type="hidden" name="capacity_max" value={total} />
        </>
      ) : (
        <label className="grid gap-1 text-small">
          Cupo máximo
          <input name="capacity_max" type="number" min={1} defaultValue={capacityMax ?? "12"} className="rounded-lg border border-line px-3 py-2" />
        </label>
      )}
    </fieldset>
  );
}
