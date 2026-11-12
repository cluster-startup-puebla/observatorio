import Link from "next/link";
import type { ContactPerson } from "@/lib/admin/crm/person";

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return words.map((word) => word[0]?.toUpperCase() ?? "").join("") || "—";
}

export function ContactoHeader({
  person,
  status,
  source,
  events,
}: {
  person: ContactPerson;
  status: string;
  source: string;
  events: number;
}) {
  return (
    <section className="rounded-2xl border border-line bg-elevated p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid size-20 shrink-0 place-items-center rounded-2xl border border-line bg-surface-subtle text-lg font-semibold text-ink">
            {initials(person.name)}
          </span>
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold text-ink">{person.name}</h2>
            {person.jobTitle ? <p className="mt-1 text-small text-ink-secondary">{person.jobTitle}</p> : null}
            {person.companyHref ? (
              <Link href={person.companyHref} className="mt-1 inline-block text-small text-link">
                {person.companyName}
              </Link>
            ) : (
              <p className="mt-1 text-small text-ink-secondary">{person.companyName}</p>
            )}
            <p className="mt-2 text-small text-ink">
              {status || "Sin estatus"} · {source}
            </p>
          </div>
        </div>
        <div className="min-w-24 rounded-xl border border-line bg-surface-subtle px-3 py-3 text-center">
          <div className="text-body font-semibold text-ink">{events}</div>
          <div className="text-small text-ink-secondary">Pasos</div>
        </div>
      </div>
    </section>
  );
}
