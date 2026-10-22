import { PanelHeader, parentLabel, trailCrumbs } from "@/components/admin/panel-header";
import { can, type Role } from "@/lib/access";
import { sendInnovationAction } from "@/lib/flow-actions";
import { getDirectory } from "@/lib/memory-directory";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";

const mailAction = usesSupabaseAuth() ? "/api/admin/correo" : sendInnovationAction;

export const instant = false;

function roleFromQuery(value: string | undefined): Role {
  if (value === "moderador") return "moderador";
  return "superadmin";
}

export default async function CorreoPage({
  searchParams,
}: {
  searchParams: Promise<{ enviado?: string; rol?: string }>;
}) {
  const params = await searchParams;
  const role = roleFromQuery(params.rol);
  const allowed = can(role, "send_mass_email");
  const count = params.enviado === "1" ? (await getDirectory().outbox()).length : null;

  const section = "/admin/correo";
  return (
    <main className="px-8 py-8">
      <PanelHeader
        title="Innovación abierta"
        lead="El aviso sale solo a quienes ya terminaron el perfil. Queda en la bandeja, sin abrir el correo todavía."
        crumbs={trailCrumbs(parentLabel(section), section, "Innovación abierta")}
        actions={
          allowed ? (
            <form action={mailAction}>
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
