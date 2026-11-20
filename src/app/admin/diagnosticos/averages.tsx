"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ActionButton } from "@/components/ui/action-button";
import { AverageDetail } from "./average-detail";

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
  const [pending, setPending] = useState(true);

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

  useEffect(() => {
    void refresh();
  }, []);

  const width = summary?.average === null || summary?.average === undefined ? 0 : Math.max(0, Math.min(100, summary.average));

  return (
    <section className="mt-4 rounded-2xl border border-line bg-elevated p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-brand uppercase">Nota</p>
          <p className="mt-2 text-h2 text-ink tabular-nums">{summary?.average ?? "—"}</p>
          <p className="mt-1 text-sm text-ink-secondary">Promedio de quienes cerraron</p>
        </div>
        <ActionButton type="button" pending={pending} pendingLabel="Actualizando…" onClick={() => void refresh()}>
          Actualizar promedios
        </ActionButton>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${width}%` }} />
      </div>
      {summary ? <AverageDetail bands={summary.bands} rows={summary.byInstrument} /> : null}
    </section>
  );
}
