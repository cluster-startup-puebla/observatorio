import Link from "next/link";
import { SessionDate } from "@/components/sessions/session-date";
import type { SectorSession } from "@/lib/app/sector-sessions";

function SessionGroup({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: SectorSession[];
}) {
  return (
    <section className="grid gap-4">
      <h2 className="text-h3 text-ink">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-body text-ink-secondary">{empty}</p>
      ) : (
        <ul className="grid gap-3">
          {rows.map((session) => (
            <li key={session.publicSlug}>
              <Link
                href={`/app/sesiones/${session.publicSlug}`}
                className="flex items-center gap-4 rounded-2xl border border-line bg-elevated p-4 transition-colors hover:border-program-field"
              >
                <SessionDate iso={session.sessionOn} />
                <span className="min-w-0">
                  <span className="block text-h3 text-ink">{session.title}</span>
                  {session.venue ? (
                    <span className="mt-1 block text-small text-ink-secondary">{session.venue}</span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function SessionGroups({
  upcoming,
  past,
}: {
  upcoming: SectorSession[];
  past: SectorSession[];
}) {
  return (
    <div className="grid gap-10">
      <SessionGroup title="Próximas" empty="No hay sesiones próximas." rows={upcoming} />
      <SessionGroup title="Pasadas" empty="No hay sesiones pasadas." rows={past} />
    </div>
  );
}
