import { crmEventAction } from "@/lib/crm-actions";
import type { CrmPerson } from "@/lib/directory";
import { orgEstado, orgEstadoLabel } from "@/lib/organismo/estado";

export function CrmTable({
  people,
  vista,
}: {
  people: CrmPerson[];
  vista: "tabla" | "tarjetas";
}) {
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full text-left text-body">
        <thead className="bg-surface-subtle text-small text-ink-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">Nombre</th>
            <th className="px-4 py-3 font-semibold">Empresa</th>
            <th className="px-4 py-3 font-semibold">Correo</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {people.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-ink-secondary" colSpan={5}>
                Todavía no hay invitaciones.
              </td>
            </tr>
          ) : (
            people.map((person) => (
              <tr key={person.id} className="border-t border-line">
                <td className="px-4 py-3">{person.nombre}</td>
                <td className="px-4 py-3">{person.empresa}</td>
                <td className="px-4 py-3">{person.correo}</td>
                <td className="px-4 py-3">{orgEstadoLabel(person.status)}</td>
                <td className="px-4 py-3">
                  {orgEstado(person.status) === "pendiente" ? (
                    <form action={crmEventAction}>
                      <input type="hidden" name="personId" value={person.id} />
                      <input type="hidden" name="event" value="contactar" />
                      <input type="hidden" name="vista" value={vista} />
                      <button type="submit" className="btn btn-primary">
                        Contactar
                      </button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
