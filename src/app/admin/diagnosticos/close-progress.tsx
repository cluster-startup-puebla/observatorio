export function CloseProgress({ started, finished }: { started: number; finished: number }) {
  const closed = Math.min(Math.max(finished, 0), Math.max(started, 0));
  const ratio = started === 0 ? 0 : Math.round((closed / started) * 100);
  const pending = Math.max(started - closed, 0);
  const caption =
    started === 0 ? "Nadie ha empezado." : pending === 0 ? "Todos cerraron el formulario." : `Faltan ${pending} por cerrar.`;

  return (
    <section className="rounded-2xl border border-line bg-elevated p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-brand uppercase">Cierre</p>
          <p className="mt-2 text-h2 text-ink tabular-nums">
            <span data-testid="acabaron">{closed}</span>
            <span className="text-ink-secondary"> / </span>
            <span data-testid="empezaron">{started}</span>
          </p>
          <p className="mt-1 text-sm text-ink-secondary">{caption}</p>
        </div>
        <p className="text-2xl font-semibold tabular-nums text-ink">{ratio}%</p>
      </div>
      <div
        className="mt-5 h-3 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label="Diagnósticos cerrados"
        aria-valuemin={0}
        aria-valuemax={started}
        aria-valuenow={closed}
      >
        <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${ratio}%` }} />
      </div>
      <div className="mt-3 flex justify-between text-xs text-ink-secondary">
        <span>Cerraron</span>
        <span>Empezaron</span>
      </div>
    </section>
  );
}
