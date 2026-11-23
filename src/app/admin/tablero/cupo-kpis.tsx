type Fill = {
  cupo: number;
  ocupados: number;
  pendientes: number;
  omitidos: { personas: number }[];
};

export function registeredTotal(fill: Fill) {
  const outside = fill.omitidos.reduce((sum, row) => sum + row.personas, 0);
  return fill.ocupados + fill.pendientes + outside;
}

export function CupoKpis({ fill }: { fill: Fill }) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <article className="rounded-2xl border border-line bg-elevated p-5" data-testid="tablero-total">
        <p className="text-small text-ink-secondary">En total</p>
        <p className="mt-2 text-h2 text-ink tabular-nums">{registeredTotal(fill).toLocaleString("es-MX")}</p>
        <p className="mt-2 text-small text-ink-muted">Ocupados, pendientes y quienes llegaron sin estar en la lista.</p>
      </article>
      <article className="rounded-2xl border border-line bg-elevated p-5" data-testid="tablero-cupo">
        <p className="text-small text-ink-secondary">Ocupados</p>
        <p className="mt-2 text-h2 text-ink tabular-nums">{places(fill)}</p>
      </article>
      <article className="rounded-2xl border border-line bg-elevated p-5" data-testid="tablero-cupo-pendiente">
        <p className="text-small text-ink-secondary">Pendientes</p>
        <p className="mt-2 text-h2 text-ink tabular-nums">{fill.pendientes.toLocaleString("es-MX")}</p>
        <p className="mt-2 text-small text-ink-muted">Solicitudes RSVP por confirmar lugar</p>
      </article>
    </section>
  );
}

function places(fill: Fill) {
  if (fill.cupo === 0) return "Sin sesión";
  const ocupados = fill.ocupados.toLocaleString("es-MX");
  const cupo = fill.cupo.toLocaleString("es-MX");
  return `${ocupados} de ${cupo}`;
}
