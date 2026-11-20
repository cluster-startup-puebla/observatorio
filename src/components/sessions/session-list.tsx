import Link from "next/link";
import { sessionOnLabel } from "@/lib/sessions/face";
import type { PublicSession } from "@/lib/sessions/load-public";
import { sessionPath } from "@/lib/sessions/public-path";

export function SessionList({ sessions }: { sessions: PublicSession[] }) {
  if (sessions.length === 0) {
    return <p className="mt-8 text-body text-ink-secondary">Todavía no hay sesiones publicadas.</p>;
  }

  return (
    <ul className="mt-10 grid gap-4">
      {sessions.map((session) => (
        <li key={session.publicSlug}>
          <Link
            href={sessionPath(session.publicSlug)}
            className="block rounded-2xl border border-line bg-elevated p-6"
          >
            <p className="text-small text-ink-muted">{sessionOnLabel(session.sessionOn)}</p>
            <h2 className="mt-2 text-h3 text-ink">{session.title}</h2>
            {session.venue ? <p className="mt-2 text-small text-ink-secondary">{session.venue}</p> : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
