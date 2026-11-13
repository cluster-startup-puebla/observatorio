import { LogoTile } from "@/app/admin/tablero/logo-tile";
import { listCrumbs, PanelHeader } from "@/components/admin/panel-header";
import { loadLatestLogos } from "@/lib/admin/tablero/latest-logos";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function AdminLogosPage() {
  await requireSuperadmin();
  const logos = await loadLatestLogos();
  const waiting = logos.some((logo) => logo.pending);
  return (
    <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
      <PanelHeader title="Se pueden mostrar" crumbs={listCrumbs("Logos", "/admin/logo")} />
      {logos.length === 0 ? (
        <p className="text-small text-ink-muted">Nadie pidió mostrar su logo.</p>
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
