import { crmEventAction } from "@/lib/crm-actions";
import { pendingInviteAction } from "@/lib/crm/link-acceptance";

export function PendingActions({
  person,
  slug,
  vista,
}: {
  person: { id: string; source: string; status: string };
  slug: string;
  vista: string;
}) {
  const action = pendingInviteAction(person);
  if (!action) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <form action={crmEventAction}>
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="personId" value={person.id} />
        <input type="hidden" name="event" value={action} />
        <input type="hidden" name="vista" value={vista} />
        <button type="submit" className="btn btn-primary">
          {action === "aceptar" ? "Aceptar" : "Contactar"}
        </button>
      </form>
      {action === "aceptar" ? (
        <form action={crmEventAction}>
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="personId" value={person.id} />
          <input type="hidden" name="event" value="rechazar" />
          <input type="hidden" name="vista" value={vista} />
          <button type="submit" className="btn btn-secondary">
            Rechazar
          </button>
        </form>
      ) : null}
    </div>
  );
}
