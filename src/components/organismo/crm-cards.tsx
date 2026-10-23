import { PendingActions } from "@/components/organismo/pending-actions";
import type { CrmPerson } from "@/lib/directory";
import { CrmCardBody } from "@/components/organismo/crm-card-body";
import { CrmHandInvite } from "@/components/organismo/crm-hand-invite";
import { orgEstado, type OrgEstado } from "@/lib/organismo/estado";

const columns: { key: OrgEstado; label: string }[] = [
  { key: "pendiente", label: "Pendiente" },
  { key: "contactado", label: "Contactado" },
  { key: "confirmado", label: "Confirmado" },
];

export function CrmCards({
  people,
  vista,
  slug,
  error,
}: {
  people: CrmPerson[];
  vista: "tabla" | "tarjetas";
  slug: string;
  error?: string;
}) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-3">
      {columns.map((column) => {
        const rows = people.filter((person) => orgEstado(person.status) === column.key);
        return (
          <section key={column.key} className="grid gap-3 rounded-2xl bg-surface-subtle p-3">
            <header className="flex items-center justify-between px-1">
              <h2 className="text-small font-semibold text-ink">{column.label}</h2>
              <span className="rounded-full bg-elevated px-2 py-0.5 text-small text-ink-secondary">{rows.length}</span>
            </header>
            {column.key === "pendiente" ? <CrmHandInvite slug={slug} error={error} /> : null}
            {rows.length === 0 ? (
              <p className="px-1 pb-2 text-small text-ink-secondary">Nadie en esta columna.</p>
            ) : (
              rows.map((person) => (
                <article key={person.id} className="grid gap-2 rounded-xl border border-line bg-elevated p-4">
                  <CrmCardBody person={person} />
                  <PendingActions person={person} slug={slug} vista={vista} />
                </article>
              ))
            )}
          </section>
        );
      })}
    </div>
  );
}
