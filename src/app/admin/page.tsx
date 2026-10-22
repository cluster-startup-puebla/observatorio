import { TableroBoard } from "@/app/admin/tablero/board";
import { homeCrumb, PanelHeader } from "@/components/admin/panel-header";
import { loadTablero } from "@/lib/admin/tablero/load";
import { lectura } from "@/lib/admin/tablero/reading";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function AdminHomePage() {
  await requireSuperadmin();
  const board = await loadTablero();
  return (
    <main className="px-4 py-6 sm:px-8 sm:py-8">
      <PanelHeader title="Convocatoria" lead={lectura(board)} crumbs={[homeCrumb]} testId="panel-superadmin" />
      <TableroBoard board={board} />
    </main>
  );
}
