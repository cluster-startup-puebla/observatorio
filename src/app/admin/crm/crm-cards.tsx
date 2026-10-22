import { CrmRowActions } from "@/app/admin/crm/row-actions";

export function CrmCards({ rows }: { rows: Record<string, string>[] }) {
  if (rows.length === 0) {
    return <p className="text-body text-ink-secondary">No hay contactos con estos filtros.</p>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <article key={row.id} className="grid gap-3 rounded-2xl border border-line bg-elevated p-5">
          <div>
            <p className="text-body font-semibold text-ink">{row.nombre}</p>
            <p className="mt-1 text-small text-ink-secondary">{row.empresa}</p>
            <p className="text-small text-ink-secondary">{row.email}</p>
          </div>
          <p className="text-small font-semibold text-ink">
            {row.status || "Sin estatus"} · {row.source}
          </p>
          <CrmRowActions row={row} />
        </article>
      ))}
    </div>
  );
}
