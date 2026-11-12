import { ChevronDown } from "lucide-react";
import { EmpresaTable } from "@/app/admin/tablero/empresa-table";
import type { DataRow } from "@/components/admin/data-columns";
import type { OmittedSector } from "@/lib/admin/tablero/sector-fill";

export function UnconvenedCard({ rows, companies }: { rows: OmittedSector[]; companies: DataRow[] }) {
  if (rows.length === 0) return null;
  const people = rows.reduce((sum, row) => sum + row.personas, 0);
  return (
    <section className="min-w-0 rounded-2xl border border-line bg-elevated p-5" data-testid="tablero-sin-convocar">
      <details className="group">
        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-h4 text-ink">Asisten y no se les convocó</h2>
              <p className="mt-1 text-small text-ink-secondary">
                Se registraron en esta sesión. Su sector no está en la convocatoria.
              </p>
              <p className="mt-4 text-h2 text-ink tabular-nums">{people.toLocaleString("es-MX")}</p>
            </div>
            <ChevronDown className="mt-1 size-4 shrink-0 text-ink-muted transition-transform group-open:rotate-180" aria-hidden />
          </div>
          <ul className="mt-4 grid gap-2">
            {rows.map((row) => (
              <li key={row.slug} className="flex items-baseline justify-between gap-4 text-small">
                <span className="text-ink">{row.sector}</span>
                <span className="text-ink-muted tabular-nums">{detail(row)}</span>
              </li>
            ))}
          </ul>
        </summary>
        <div className="mt-4 min-w-0">
          <EmpresaTable rows={companies} />
        </div>
      </details>
    </section>
  );
}

function detail(row: OmittedSector) {
  const people = row.personas === 1 ? "1 persona" : `${row.personas.toLocaleString("es-MX")} personas`;
  if (row.pendientes === 0) return people;
  const pending = row.pendientes === 1 ? "1 por aceptar" : `${row.pendientes.toLocaleString("es-MX")} por aceptar`;
  return `${people} · ${pending}`;
}
