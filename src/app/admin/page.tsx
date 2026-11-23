import { TableroBoard } from "@/app/admin/tablero/board";
import { SessionSelect } from "@/app/admin/tablero/session-select";
import { homeCrumb, PanelHeader } from "@/components/admin/panel-header";
import { loadLatestLogos } from "@/lib/admin/tablero/latest-logos";
import { loadTablero } from "@/lib/admin/tablero/load";
import { loadCupos } from "@/lib/admin/tablero/load-cupos";
import { loadOrgOpens } from "@/lib/admin/tablero/load-org-opens";
import { lectura } from "@/lib/admin/tablero/reading";
import { loadSessionChoices } from "@/lib/admin/tablero/session-choices";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ sesion?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const [board, cupos, choices, logos, opens] = await Promise.all([
    loadTablero(params.sesion),
    loadCupos(params.sesion),
    loadSessionChoices(),
    loadLatestLogos(params.sesion),
    loadOrgOpens(params.sesion),
  ]);
  return (
    <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
      <PanelHeader title="Convocatoria" lead={lectura(board)} crumbs={[homeCrumb]} testId="panel-superadmin" />
      <div className="mb-6">
        <SessionSelect choices={choices} selectedId={cupos.session?.id ?? null} />
      </div>
      <TableroBoard board={board} cupos={cupos} logos={logos} opens={opens} />
    </main>
  );
}
