import Link from "next/link";
import { areaLabel, isChallengeArea } from "@/lib/challenges/areas";
import type { PortalChallenge } from "@/lib/retos/load-portal";

export function RetosList({ rows }: { rows: PortalChallenge[] }) {
  if (rows.length === 0) {
    return (
      <p className="mt-10 text-body text-ink-secondary">
        Todavía no hay retos publicados en el portal.
      </p>
    );
  }

  return (
    <ul className="mt-10 divide-y divide-line border-y border-line">
      {rows.map((row) => (
        <li key={row.id} className="py-5">
          <Link href={`/retos/${row.id}`} className="group flex items-start gap-3">
            {row.logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.logoSrc}
                alt=""
                className="mt-0.5 size-10 shrink-0 rounded-md border border-line bg-elevated object-contain"
              />
            ) : null}
            <span className="grid min-w-0 gap-1">
              <span className="font-display text-lg font-bold text-ink group-hover:text-link">
                {row.name}
              </span>
              <span className="text-small text-ink-secondary">
                {isChallengeArea(row.area) ? areaLabel(row.area) : row.area}
                {" · "}
                {row.companyLabel}
                {row.urgency ? ` · Urgencia ${row.urgency}` : ""}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
