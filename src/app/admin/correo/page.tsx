import { BroadcastForms } from "@/app/admin/correo/broadcast-forms";
import { PanelHeader, parentLabel, trailCrumbs } from "@/components/admin/panel-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { can, type Role } from "@/lib/access";
import { adminDb } from "@/lib/admin/admin-db";
import { sentCount } from "@/lib/admin/correo/sent-count";
import { broadcastSentLine } from "@/lib/admin/correo/sent-line";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { sendInnovationAction } from "@/lib/flow-actions";
import { loadMailSessions } from "@/lib/mail/mail-sessions";
import { getDirectory } from "@/lib/memory-directory";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";

const mailAction = usesSupabaseAuth() ? "/api/admin/correo" : sendInnovationAction;

export const instant = false;

function roleFromQuery(value: string | undefined): Role {
  if (value === "moderador") return "moderador";
  return "superadmin";
}

async function openInnovationSent() {
  if (!usesSupabaseAuth()) return (await getDirectory().outbox()).length;
  const db = await adminDb();
  if (!db) return null;
  const sent = await db.from("outbox_messages").select("kind").eq("kind", "open_innovation");
  return sent.error ? null : sentCount(sent.data ?? []);
}

export default async function CorreoPage({
  searchParams,
}: {
  searchParams: Promise<{ enviado?: string; rol?: string; error?: string; n?: string }>;
}) {
  if (usesSupabaseAuth()) await requireSuperadmin();
  const params = await searchParams;
  const role = roleFromQuery(params.rol);
  const allowed = can(role, "send_mass_email");
  const count = params.enviado === "1" ? (params.n ? Number(params.n) : await openInnovationSent()) : null;
  const sessions = usesSupabaseAuth() ? await loadMailSessions() : [];
  const section = "/admin/correo";
  return (
    <main className="px-8 py-8">
      <PanelHeader
        title="Correos"
        lead="Innovación abierta, recordatorio y gracias salen a los correos de quien ya se registró."
        crumbs={trailCrumbs(parentLabel(section), section, "Correos")}
      />
      {params.error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{params.error}</AlertDescription>
        </Alert>
      ) : null}
      {allowed ? (
        <BroadcastForms
          action={mailAction}
          sessions={sessions}
          mass={usesSupabaseAuth()}
          innovationLabel="Enviar innovación abierta"
        />
      ) : null}
      {count !== null && Number.isFinite(count) ? (
        <p data-testid="encolados" className="text-body text-ink">
          {broadcastSentLine(count)}
        </p>
      ) : null}
    </main>
  );
}
