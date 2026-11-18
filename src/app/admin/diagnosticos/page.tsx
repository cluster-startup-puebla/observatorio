import { Averages } from "./averages";
import { CloseProgress } from "./close-progress";
import { DiagnosticosRefresh } from "@/app/admin/diagnosticos/refresh";
import { listCrumbs, PanelHeader } from "@/components/admin/panel-header";
import { tally } from "@/lib/admin/diagnosticos/tally";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function DiagnosticosPage() {
  await requireSuperadmin();
  const counts = await tally();

  return (
    <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
      <PanelHeader
        title="Diagnósticos"
        lead="De quienes empezaron, cuántos ya cerraron."
        crumbs={listCrumbs("Diagnósticos", "/admin/diagnosticos")}
        actions={<DiagnosticosRefresh />}
      />
      <CloseProgress started={counts.started} finished={counts.finished} />
      <Averages />
    </main>
  );
}
