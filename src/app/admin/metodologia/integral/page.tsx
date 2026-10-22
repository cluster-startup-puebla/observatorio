import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { adminDb } from "@/lib/admin/admin-db";

export const instant = false;

export default async function IntegralPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireSuperadmin();
  const query = await searchParams;
  const db = await adminDb();
  const bands = db ? await db.from("integral_bands").select("level, min_score, max_score, riesgo, reto") : { data: [], error: null };
  if (bands.error) throw new Error(bands.error.message);
  return (
    <main className="px-8 py-8">
      <a className="text-link" href="/admin/metodologia">
        Volver
      </a>
      <h1 className="mt-4 text-h1 text-ink">Bandas integrales</h1>
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      <ul className="mt-6 grid gap-4">
        {(bands.data ?? []).map((band) => (
          <li key={band.level}>
            <form action="/api/admin/metodologia/integral" method="post" className="grid max-w-xl gap-2">
              <p>{band.level}</p>
              <input type="hidden" name="level" value={band.level} />
              <input name="min_score" type="number" defaultValue={band.min_score} />
              <input name="max_score" type="number" defaultValue={band.max_score} />
              <input name="riesgo" defaultValue={band.riesgo} />
              <input name="reto" defaultValue={band.reto} />
              <button className="btn" type="submit">
                Guardar banda
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
