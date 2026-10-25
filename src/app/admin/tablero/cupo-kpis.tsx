type Fill = { cupo: number; ocupados: number; pendientes: number };

export function CupoKpis({ fill }: { fill: Fill }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <article className="rounded-2xl border border-line bg-elevated p-5" data-testid="tablero-cupo">
        <p className="text-small text-ink-secondary">Ocupados</p>
        <p className="mt-2 text-h2 text-ink tabular-nums">{places(fill)}</p>
      </article>
      <article className="rounded-2xl border border-line bg-elevated p-5" data-testid="tablero-cupo-pendiente">
        <p className="text-small text-ink-secondary">Pendientes</p>
        <p className="mt-2 text-h2 text-ink tabular-nums">{fill.pendientes.toLocaleString("es-MX")}</p>
        <p className="mt-2 text-small text-ink-muted">Terminaron el perfil y siguen sin aceptar</p>
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
