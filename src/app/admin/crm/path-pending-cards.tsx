import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PathPending } from "@/lib/admin/crm/path-pending";

export function PathPendingCards({ rows }: { rows: PathPending[] }) {
  if (!rows.length) return null;
  return (
    <section className="mb-8 grid gap-3 rounded-2xl border border-line bg-surface-subtle p-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-ink">Se registraron solos</h2>
          <p className="text-small text-ink-secondary">Terminaron el perfil y faltan de aceptar.</p>
        </div>
        <span className="rounded-full bg-elevated px-2 py-0.5 text-small text-ink-secondary">{rows.length}</span>
      </header>
      <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <article key={row.id} className="grid gap-3 rounded-2xl border border-line bg-elevated p-4">
            <div>
              <p className="font-semibold text-ink">{row.empresa}</p>
              <p className="text-small text-ink">{row.nombre}</p>
              <p className="text-small text-ink-secondary">{row.sector}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/empresas/${row.id}`}>Ver detalle</Link>
              </Button>
              <form action={`/api/admin/empresas/${row.id}/aceptar`} method="post">
                <input type="hidden" name="next" value="/admin/crm?vista=tarjetas" />
                <Button type="submit" size="sm">
                  <BadgeCheck />
                  Aceptar
                </Button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
