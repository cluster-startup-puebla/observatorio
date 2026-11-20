import Link from "next/link";
import { SessionDate } from "@/components/sessions/session-date";
import { sessionDateParts, sessionOnLabel } from "@/lib/sessions/face";
import type { PublicSession } from "@/lib/sessions/load-public";
import { sessionPath } from "@/lib/sessions/public-path";

export function SessionList({ sessions }: { sessions: PublicSession[] }) {
  if (sessions.length === 0) {
    return <p className="mt-8 text-body text-ink-secondary">Todavía no hay sesiones publicadas.</p>;
  }

  return (
    <ul className="mt-10 grid gap-4">
      {sessions.map((session) => {
        const parts = sessionDateParts(session.sessionOn);
        return (
          <li key={session.publicSlug}>
            <Link
              href={sessionPath(session.publicSlug)}
              aria-label={`${sessionOnLabel(session.sessionOn)}. ${session.title}`}
              className="flex items-center gap-4 rounded-2xl border border-line bg-elevated p-4 transition-colors hover:border-program-field sm:gap-5 sm:p-5"
            >
              <SessionDate iso={session.sessionOn} />
              <div className="min-w-0">
                <p className="text-small text-ink-muted">{parts ? parts.year : session.sessionOn}</p>
                <h2 className="mt-1 text-h3 text-ink">{session.title}</h2>
                {session.venue ? <p className="mt-1 text-small text-ink-secondary">{session.venue}</p> : null}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
