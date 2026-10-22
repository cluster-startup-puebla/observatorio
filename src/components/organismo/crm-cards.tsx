import { crmEventAction } from "@/lib/crm-actions";
import type { CrmPerson } from "@/lib/directory";
import { orgEstado, orgEstadoLabel } from "@/lib/organismo/estado";

export function CrmCards({
  people,
  vista,
}: {
  people: CrmPerson[];
  vista: "tabla" | "tarjetas";
}) {
  if (people.length === 0) {
    return <p className="text-body text-ink-secondary">Todavía no hay invitaciones.</p>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {people.map((person) => (
        <article key={person.id} className="rounded-2xl border border-line bg-elevated p-5">
          <p className="text-body font-semibold text-ink">{person.nombre}</p>
          <p className="mt-1 text-small text-ink-secondary">{person.empresa}</p>
          <p className="mt-1 text-small text-ink-secondary">{person.correo}</p>
          <p className="mt-3 text-small font-semibold text-ink">{orgEstadoLabel(person.status)}</p>
          {orgEstado(person.status) === "pendiente" ? (
            <form action={crmEventAction} className="mt-4">
              <input type="hidden" name="personId" value={person.id} />
              <input type="hidden" name="event" value="contactar" />
              <input type="hidden" name="vista" value={vista} />
              <button type="submit" className="btn btn-primary">
                Contactar
              </button>
            </form>
          ) : null}
        </article>
      ))}
    </div>
  );
}
