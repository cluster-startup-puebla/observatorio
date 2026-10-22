import { FormSheet } from "@/components/admin/form-sheet";
import { PanelHeader, parentLabel, trailCrumbs } from "@/components/admin/panel-header";
import { adminDb } from "@/lib/admin/admin-db";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function IntegralPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireSuperadmin();
  const query = await searchParams;
  const db = await adminDb();
  const bands = db ? await db.from("integral_bands").select("level, min_score, max_score, riesgo, reto") : { data: [], error: null };
  if (bands.error) throw new Error(bands.error.message);
  const section = "/admin/metodologia";
  return (
    <main className="px-8 py-8">
      <PanelHeader
        title="Bandas integrales"
        crumbs={trailCrumbs(parentLabel(section), section, "Bandas integrales")}
      />
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      <ul className="mt-6 grid gap-4">
        {(bands.data ?? []).map((band) => (
          <li key={band.level}>
            <FormSheet action="Editar" resource={`banda ${band.level}`}>
              <form action="/api/admin/metodologia/integral" method="post" className="grid gap-2">
                <input type="hidden" name="level" value={band.level} />
                <input name="min_score" type="number" defaultValue={band.min_score} />
                <input name="max_score" type="number" defaultValue={band.max_score} />
                <input name="riesgo" defaultValue={band.riesgo} />
                <input name="reto" defaultValue={band.reto} />
                <button className="btn" type="submit">
                  Guardar banda
                </button>
              </form>
            </FormSheet>
          </li>
        ))}
      </ul>
    </main>
  );
}
