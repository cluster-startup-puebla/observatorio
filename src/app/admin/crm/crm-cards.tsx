import { CrmRowActions } from "@/app/admin/crm/row-actions";
import { crmLabel } from "@/lib/crm-label";

const stages = ["cargado", "contactado", "confirmo", "registrado", "llego", "no"] as const;

export function CrmCards({ rows }: { rows: Record<string, string>[] }) {
  return (
    <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
      {stages.map((stage) => {
        const items = rows.filter((row) => row.estado === stage);
        return (
          <section key={stage} className="grid min-w-0 gap-3 rounded-2xl bg-surface-subtle p-3">
            <header className="flex items-center justify-between px-1">
              <h2 className="text-small font-semibold text-ink">{crmLabel(stage)}</h2>
              <span className="rounded-full bg-elevated px-2 py-0.5 text-small text-ink-secondary">{items.length}</span>
            </header>
            {items.length === 0 ? (
              <p className="px-1 pb-2 text-small text-ink-secondary">Nadie en esta columna.</p>
            ) : (
              items.map((row) => (
                <article key={row.id} className="grid gap-3 rounded-2xl border border-line bg-elevated p-4">
                  <div>
                    <p className="font-semibold text-ink">{row.nombre}</p>
                    <p className="text-small text-ink-secondary">{row.empresa}</p>
                    <p className="text-small text-ink-secondary">{row.email}</p>
                  </div>
                  <CrmRowActions row={row} />
                </article>
              ))
            )}
          </section>
        );
      })}
    </div>
  );
}
