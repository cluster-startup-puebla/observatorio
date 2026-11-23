import Link from "next/link";
import type { SessionAttendee } from "@/lib/admin/sesiones/load-attendees";

export function AsistentesTab({ rows }: { rows: SessionAttendee[] }) {
  if (rows.length === 0) {
    return <p className="text-small text-ink-muted">Nadie está ligado a esta sesión todavía.</p>;
  }
  return (
    <ul className="grid gap-2">
      {rows.map((row) => (
        <li key={row.companyId} className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2">
          <div className="min-w-0">
            <Link href={`/admin/empresas/${row.companyId}`} className="text-small text-link">
              {row.legalName}
            </Link>
            <p className="text-small text-ink-muted">{row.sectorName || "Sin sector"}</p>
          </div>
          <span className="text-small text-ink-muted">{row.source === "rsvp" ? "RSVP" : "Sesión"}</span>
        </li>
      ))}
    </ul>
  );
}
