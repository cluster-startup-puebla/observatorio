import { ActionButton } from "@/components/ui/action-button";
import { crmEventAction } from "@/lib/crm-actions";
import { pendingInviteAction } from "@/lib/crm/link-acceptance";

export function PendingActions({
  person,
  slug,
  vista,
  sessionSlug,
}: {
  person: { id: string; source: string; status: string };
  slug: string;
  vista: string;
  sessionSlug?: string;
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
        {sessionSlug ? <input type="hidden" name="sessionSlug" value={sessionSlug} /> : null}
        <ActionButton pendingLabel={action === "aceptar" ? "Confirmando…" : "Contactando…"}>
          {action === "aceptar" ? "Aceptar en lista" : "Contactar"}
        </ActionButton>
      </form>
      {action === "aceptar" ? (
        <form action={crmEventAction}>
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="personId" value={person.id} />
          <input type="hidden" name="event" value="rechazar" />
          <input type="hidden" name="vista" value={vista} />
          {sessionSlug ? <input type="hidden" name="sessionSlug" value={sessionSlug} /> : null}
          <ActionButton variant="secondary" pendingLabel="Rechazando…">
            Rechazar
          </ActionButton>
        </form>
      ) : null}
    </div>
  );
}
