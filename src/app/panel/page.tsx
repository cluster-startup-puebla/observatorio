import { Kicker } from "@/components/landing/atoms/kicker";
import type { Role } from "@/lib/access";
import { getDirectory } from "@/lib/memory-directory";

export const instant = false;

function roleFromQuery(value: string | undefined): Role {
  if (value === "moderador") return "moderador";
  return "superadmin";
}

export default async function PanelPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string }>;
}) {
  const params = await searchParams;
  const role = roleFromQuery(params.rol);
  const rows = role === "superadmin" || role === "moderador" ? await getDirectory().progress() : [];

  return (
    <section className="container-site py-10 lg:py-14">
      <div className="grid max-w-3xl gap-6">
        <Kicker>Superadmin</Kicker>
        <h1 className="text-h1 text-ink">Avance de la metodología</h1>
        {rows.length === 0 ? (
          <p className="text-body text-ink-secondary">Todavía no hay respuestas.</p>
        ) : (
          <ul className="divide-y divide-line border border-line">
            {rows.map((row) => (
              <li key={row.personId} className="flex items-center justify-between gap-4 px-4 py-3 text-body text-ink">
                <span>{row.personId}</span>
                <span data-testid={`avance-${row.personId}`}>{row.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
