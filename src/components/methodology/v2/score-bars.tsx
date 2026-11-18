import type { V2LiveScore } from "@/lib/methodology/v2/live";

const ROWS: { key: keyof Pick<V2LiveScore, "estadoDerecho" | "innovacion" | "comercial" | "satNivel2">; label: string; hint: string }[] = [
  { key: "estadoDerecho", label: "Entorno", hint: "Trámites, seguridad, autoridad, servicios y justicia." },
  { key: "innovacion", label: "Innovación", hint: "Cuánto renuevas equipo, procesos o la forma de dar el servicio." },
  { key: "comercial", label: "Comercial", hint: "Qué tan propio es lo que vendes y qué tan exigente es quien te compra." },
  { key: "satNivel2", label: "Uso de tecnología", hint: "Qué tanto aprovechas la tecnología que ya tienes." },
];

export function ScoreBars({ score }: { score: V2LiveScore }) {
  return (
    <section className="space-y-4">
      <h2 className="text-body font-semibold text-ink">De dónde sale</h2>
      {ROWS.map((row) => {
        const value = score[row.key];
        if (value === null) return null;
        const width = Math.max(0, Math.min(100, value));
        return (
          <div key={row.label}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-body font-medium text-ink">{row.label}</p>
              <p className="text-body font-semibold tabular-nums text-ink">{value.toFixed(2)}</p>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-brand" style={{ width: `${width}%` }} />
            </div>
            <p className="mt-1 text-small leading-snug text-ink-secondary">{row.hint}</p>
          </div>
        );
      })}
    </section>
  );
}
