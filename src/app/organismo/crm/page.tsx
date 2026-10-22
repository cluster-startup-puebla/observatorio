import { Kicker } from "@/components/landing/atoms/kicker";
import { crmEventAction } from "@/lib/crm-actions";
import { crmLabel } from "@/lib/crm-label";
import { getDirectory } from "@/lib/memory-directory";
import { readAccountId } from "@/lib/session";

export const instant = false;

export default async function CrmPage() {
  const id = await readAccountId();
  const people = id ? await getDirectory().crm(id) : [];

  return (
    <div className="grid gap-6">
      <header className="grid gap-3">
        <Kicker>CRM</Kicker>
        <h1 className="text-h1 text-ink">Invitaciones</h1>
      </header>
      <div className="overflow-x-auto border border-line">
        <table className="w-full text-left text-body">
          <thead className="bg-surface-subtle text-small text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Correo</th>
              <th className="px-4 py-3 font-semibold">Estatus</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {people.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-ink-secondary" colSpan={3}>
                  Todavía no hay invitaciones.
                </td>
              </tr>
            ) : (
              people.map((person) => {
                const label = crmLabel(person.status);
                const canAct = label === "Cargado" || label === "Contactado";
                return (
                  <tr key={person.id} className="border-t border-line">
                    <td className="px-4 py-3">{person.correo}</td>
                    <td className="px-4 py-3">{label}</td>
                    <td className="px-4 py-3">
                      {canAct ? (
                        <div className="flex flex-wrap gap-2">
                          <form action={crmEventAction}>
                            <input type="hidden" name="personId" value={person.id} />
                            <input type="hidden" name="event" value="contactar" />
                            <button type="submit" className="btn btn-primary">
                              Contactar
                            </button>
                          </form>
                          <form action={crmEventAction}>
                            <input type="hidden" name="personId" value={person.id} />
                            <input type="hidden" name="event" value="rechazar" />
                            <button type="submit" className="btn btn-secondary">
                              Rechazar
                            </button>
                          </form>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
