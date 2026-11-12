import { PersonCard } from "@/components/admin/person-card";
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
    <PersonCard
      mark={initials(person.name)}
      title={person.name}
      line={person.jobTitle}
      href={person.companyHref}
      hrefLabel={person.companyName}
      note={<p className="text-small text-ink">{status || "Sin estatus"} · {source}</p>}
      stat={String(events)}
      statLabel="Pasos"
    />
  );
}
