import { Averages } from "./averages";
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
        lead="Quién empezó el formulario y quién lo cerró."
        crumbs={listCrumbs("Diagnósticos", "/admin/diagnosticos")}
        actions={<DiagnosticosRefresh />}
      />
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-line bg-elevated p-5">
          <p className="text-small text-ink-secondary">Empezaron</p>
          <p className="mt-2 text-h2 text-ink tabular-nums" data-testid="empezaron">
            {counts.started}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-elevated p-5">
          <p className="text-small text-ink-secondary">Acabaron</p>
          <p className="mt-2 text-h2 text-ink tabular-nums" data-testid="acabaron">
            {counts.finished}
          </p>
        </article>
      </section>
      <Averages />
    </main>
  );
}
