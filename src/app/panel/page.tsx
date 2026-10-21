import { Kicker } from "@/components/landing/atoms/kicker";
import { getDirectory } from "@/lib/memory-directory";

export const instant = false;

export default async function PanelPage() {
  const rows = await getDirectory().progress();

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
