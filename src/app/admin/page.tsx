import { TableroBoard } from "@/app/admin/tablero/board";
import { homeCrumb, PanelHeader } from "@/components/admin/panel-header";
import { loadTablero } from "@/lib/admin/tablero/load";
import { loadCupos } from "@/lib/admin/tablero/load-cupos";
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
  const [board, cupos, choices] = await Promise.all([
    loadTablero(),
    loadCupos(params.sesion),
    loadSessionChoices(),
  ]);
  return (
    <main className="px-4 py-6 sm:px-8 sm:py-8">
      <PanelHeader title="Convocatoria" lead={lectura(board)} crumbs={[homeCrumb]} testId="panel-superadmin" />
      <TableroBoard board={board} cupos={cupos} choices={choices} />
    </main>
  );
}
