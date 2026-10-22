import type { CrmPerson } from "@/lib/directory";
import { sectors } from "@/lib/sectors";

function sectorName(slug: string) {
  return sectors.find((item) => item.slug === slug)?.name ?? "";
}

export function CrmCardBody({ person }: { person: CrmPerson }) {
  const sector = sectorName(person.sector);
  return (
    <div className="grid gap-1">
      <p className="text-body font-semibold text-ink">{person.nombre || person.correo}</p>
      {person.empresa ? <p className="text-small text-ink-secondary">{person.empresa}</p> : null}
      {person.nombre ? <p className="text-small text-ink-secondary">{person.correo}</p> : null}
      {sector ? <p className="text-small text-ink-secondary">{sector}</p> : null}
    </div>
  );
}
