"use client";

import { useState } from "react";
import { toast } from "sonner";

type Summary = {
  average: number | null;
  finished: number;
  bands: Record<string, number>;
  byInstrument: { instrumentId: string; average: number; finished: number }[];
};

async function loadSummary() {
  const response = await fetch("/api/admin/diagnosticos/promedio", { cache: "no-store" });
  if (!response.ok) throw new Error("promedio");
  return (await response.json()) as Summary;
}

export function Averages() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [pending, setPending] = useState(false);

  async function refresh() {
    setPending(true);
    try {
      setSummary(await loadSummary());
    } catch {
      toast.error("No se pudieron cargar los promedios.");
    } finally {
      setPending(false);
    }
  }

  if (!summary) {
    return (
      <button className="btn btn-secondary" type="button" disabled={pending} onClick={() => void refresh()}>
        Ver promedios
      </button>
    );
  }

  return (
    <section className="space-y-3 border border-line bg-surface-subtle p-4 text-ink">
      <p className="text-body">Promedio: {summary.average ?? "—"}</p>
      <p className="text-small text-ink-secondary">Bandas</p>
      <ul className="text-small">
        {Object.entries(summary.bands).map(([band, count]) => (
          <li key={band}>
            {band}: {count}
          </li>
        ))}
      </ul>
      <p className="text-small text-ink-secondary">Por instrumento</p>
      <ul className="text-small">
        {summary.byInstrument.map((row) => (
          <li key={row.instrumentId}>
            {row.instrumentId}: {row.average}
          </li>
        ))}
      </ul>
      <button className="btn btn-secondary" type="button" disabled={pending} onClick={() => void refresh()}>
        Actualizar promedios
      </button>
    </section>
  );
}
