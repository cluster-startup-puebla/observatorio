import { LogoTile } from "@/app/admin/tablero/logo-tile";
import { SessionPrompt } from "@/app/admin/tablero/session-prompt";
import { SessionSelect } from "@/app/admin/tablero/session-select";
import { listCrumbs, PanelHeader } from "@/components/admin/panel-header";
import { loadLatestLogos } from "@/lib/admin/tablero/latest-logos";
import { loadSessionChoices } from "@/lib/admin/tablero/session-choices";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function AdminLogosPage({
  searchParams,
}: {
  searchParams: Promise<{ sesion?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const sessionId = params.sesion?.trim() || null;
  const choices = await loadSessionChoices();

  if (!sessionId) {
    return (
      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
        <PanelHeader
          title="Se pueden mostrar"
          lead="Selecciona una sesión para ver los logos de esa convocatoria."
          crumbs={listCrumbs("Logos", "/admin/logo")}
        />
        <div className="mb-6">
          <SessionSelect choices={choices} selectedId={null} basePath="/admin/logo" submitLabel="Ver logos" />
        </div>
        <SessionPrompt lead="Elige una sesión arriba para ver los logos de esa convocatoria." />
      </main>
    );
  }

  const logos = await loadLatestLogos(sessionId);
  const waiting = logos.some((logo) => logo.pending);
  return (
    <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
      <PanelHeader title="Se pueden mostrar" crumbs={listCrumbs("Logos", "/admin/logo")} />
      <div className="mb-6">
        <SessionSelect choices={choices} selectedId={sessionId} basePath="/admin/logo" submitLabel="Ver logos" />
      </div>
      {logos.length === 0 ? (
        <p className="text-small text-ink-muted">Nadie pidió mostrar su logo en esta sesión.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {logos.map((logo) => (
            <li key={logo.companyId}>
              <LogoTile logo={logo} />
            </li>
          ))}
        </ul>
      )}
      {waiting ? <p className="mt-4 text-small text-ink-muted">En gris falta confirmarles su asistencia.</p> : null}
    </main>
  );
}
