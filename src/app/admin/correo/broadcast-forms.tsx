import { SheetSubmit } from "@/components/admin/sheet-submit";
import { SessionPick } from "@/components/session-pick";

type MailAction = string | ((formData: FormData) => void | Promise<void>);

export function BroadcastForms({
  action,
  sessions,
  mass,
  innovationLabel,
}: {
  action: MailAction;
  sessions: { id: string; label: string }[];
  mass: boolean;
  innovationLabel: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4">
      <form action={action} method="post">
        <input type="hidden" name="kind" value="open_innovation" />
        <SheetSubmit pendingLabel="Enviando…">{innovationLabel}</SheetSubmit>
      </form>
      {mass ? <SessionMail action={action} sessions={sessions} kind="reminder" label="Enviar recordatorio" /> : null}
      {mass ? <SessionMail action={action} sessions={sessions} kind="thanks" label="Enviar gracias" /> : null}
    </div>
  );
}

function SessionMail({
  action,
  sessions,
  kind,
  label,
}: {
  action: MailAction;
  sessions: { id: string; label: string }[];
  kind: string;
  label: string;
}) {
  const ready = sessions.length > 0;
  return (
    <form action={action} method="post" className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="kind" value={kind} />
      {ready ? <SessionPick sessions={sessions} /> : <p className="text-small text-ink-secondary">No hay sesión vigente.</p>}
      <SheetSubmit disabled={!ready} pendingLabel="Enviando…">
        {label}
      </SheetSubmit>
    </form>
  );
}
