import { PanelHeader, parentLabel, trailCrumbs } from "@/components/admin/panel-header";
import { can, type Role } from "@/lib/access";
import { adminDb } from "@/lib/admin/admin-db";
import { sentCount } from "@/lib/admin/correo/sent-count";
import { sendInnovationAction } from "@/lib/flow-actions";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
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
  searchParams: Promise<{ enviado?: string; rol?: string }>;
}) {
  if (usesSupabaseAuth()) await requireSuperadmin();
  const params = await searchParams;
  const role = roleFromQuery(params.rol);
  const allowed = can(role, "send_mass_email");
  const count = params.enviado === "1" ? await openInnovationSent() : null;

  const section = "/admin/correo";
  return (
    <main className="px-8 py-8">
      <PanelHeader
        title="Innovación abierta"
        lead="El aviso sale solo a quienes ya terminaron el perfil. Queda en la bandeja, sin abrir el correo todavía."
        crumbs={trailCrumbs(parentLabel(section), section, "Innovación abierta")}
        actions={
          allowed ? (
            <form action={mailAction} method="post">
              <button type="submit" className="btn btn-primary">
                Enviar innovación abierta
              </button>
            </form>
          ) : null
        }
      />
      {count !== null ? (
        <p data-testid="encolados" className="text-body text-ink">
          {count}
        </p>
      ) : null}
    </main>
  );
}
