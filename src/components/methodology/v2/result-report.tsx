import type { V2Report } from "@/lib/methodology/v2/report";
import { frontierReading, useReading } from "@/lib/methodology/v2/readings";

export function ResultReport({ report }: { report: V2Report }) {
  const operation = report.underuse || report.frontier || report.control || report.traceability;
  const path = report.sophistication.length > 0 || report.clubs.length > 0 || Boolean(report.demand);
  return (
    <div className="space-y-8">
      {operation ? (
        <section className="space-y-3">
          <p className="text-xs font-semibold tracking-wide text-brand uppercase">La planta</p>
          <h2 className="text-base font-semibold text-ink">La operación</h2>
          {report.underuse ? <Callout color={levelColor(report.underuse.used)} {...useReading(report.underuse.used)} /> : null}
          {report.frontier ? <Callout color={levelColor(report.frontier.score)} {...frontierReading(report.frontier.score)} /> : null}
          {report.control ? <Meter title="Control de la operación" label={report.control.label} score={report.control.score} /> : null}
          {report.traceability ? <Meter title="Trazabilidad" label={report.traceability.label} score={report.traceability.score} /> : null}
        </section>
      ) : null}
      {path ? <section className="space-y-3">
        <p className="text-xs font-semibold tracking-wide text-brand uppercase">El camino</p>
        {report.sophistication.length > 0 ? <Pile title="Hacia dónde puede moverse" items={report.sophistication} /> : null}
        {report.clubs.length > 0 ? <Pile title="Qué puede compartir" items={report.clubs} /> : null}
        {report.demand ? <Callout color="var(--brand-primary)" title="Lo que quiere atender ya" body={report.demand} /> : null}
      </section> : null}
    </div>
  );
}

function Pile({ title, items }: { title: string; items: { title: string; label: string }[] }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {items.map((item) => (
        <Callout key={item.title} color="var(--brand-primary)" title={item.title} body={item.label} />
      ))}
    </div>
  );
}

function Callout({ title, body, color }: { title: string; body: string; color: string }) {
  return (
    <div className="rounded-2xl border border-line bg-elevated px-4 py-3" style={{ borderLeftWidth: 4, borderLeftColor: color }}>
      <p className="text-sm font-medium text-ink-secondary">{title}</p>
      <p className="mt-1 text-sm leading-relaxed break-words text-ink">{body}</p>
    </div>
  );
}

function Meter({ title, label, score }: { title: string; label: string; score: number }) {
  const width = Math.max(0, Math.min(100, score));
  return (
    <div className="rounded-2xl border border-line bg-elevated px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-sm font-semibold tabular-nums text-ink">{score.toFixed(0)}</p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: levelColor(score) }} />
      </div>
      <p className="mt-2 text-sm leading-snug break-words text-ink-secondary">{label}</p>
    </div>
  );
}

function levelColor(score: number) {
  if (score >= 80) return "var(--success)";
  if (score >= 50) return "var(--warning)";
  return "var(--error)";
}
