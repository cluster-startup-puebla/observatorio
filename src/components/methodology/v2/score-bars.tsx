import type { V2LiveScore } from "@/lib/methodology/v2/live";

const ROWS: {
  key: keyof Pick<V2LiveScore, "estadoDerecho" | "innovacion" | "comercial" | "satNivel2">;
  label: string;
  hint: string;
  tone: string;
}[] = [
  { key: "estadoDerecho", label: "Entorno", hint: "Trámites, seguridad, autoridad y justicia.", tone: "var(--brand-primary)" },
  { key: "innovacion", label: "Innovación", hint: "Cuánto renuevas equipo o procesos.", tone: "var(--success)" },
  { key: "comercial", label: "Comercial", hint: "Qué tan exigente es quien te compra.", tone: "var(--warning)" },
  { key: "satNivel2", label: "Tecnología", hint: "Qué tanto aprovechas lo que ya tienes.", tone: "var(--info)" },
];

export function ScoreBars({ score }: { score: V2LiveScore }) {
  return (
    <section className="space-y-3">
      <p className="text-xs font-semibold tracking-wide text-brand uppercase">La nota</p>
      <h2 className="text-base font-semibold text-ink">De dónde sale</h2>
      <div className="grid grid-cols-2 gap-3">
        {ROWS.map((row) => {
          const value = score[row.key];
          if (value === null) return null;
          const width = Math.max(0, Math.min(100, value));
          return (
            <article key={row.label} className="rounded-2xl border border-line bg-elevated p-3">
              <p className="text-sm text-ink-secondary">{row.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value.toFixed(0)}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: row.tone }} />
              </div>
              <p className="mt-2 text-xs leading-snug text-ink-secondary">{row.hint}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
