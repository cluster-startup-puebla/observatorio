import { FormSheet } from "@/components/admin/form-sheet";
import { OrganismoLogoTab } from "@/app/admin/organismos/[id]/logo-tab";
import { SheetSubmit } from "@/components/admin/sheet-submit";
import { SessionPick } from "@/components/session-pick";

export function OrganismoTabs({
  id,
  active,
  enlace,
  data,
}: {
  id: string;
  active: string;
  enlace?: string;
  data: {
    members: { id: string; role: string; email: string | null }[];
    contacts: { id: string; email: string | null; source: string }[];
    copies: { id: string }[];
    sectors: { id: string; name: string | null }[];
    sessions: { id: string; label: string }[];
    logo: { object_path: string } | null;
  };
}) {
  if (active === "miembros") {
    return (
      <ul className="mt-4">
        {data.members.map((row) => (
          <li key={row.id}>
            {row.role}: {row.email}
          </li>
        ))}
      </ul>
    );
  }
  if (active === "crm") {
    return (
      <ul className="mt-4">
        {data.contacts.map((row) => (
          <li key={row.id}>
            {row.email} · {row.source}
          </li>
        ))}
      </ul>
    );
  }
  if (active === "enlace") {
    return (
      <div className="mt-4 grid gap-3">
        {enlace ? <p data-testid="enlace-evento">{enlace}</p> : null}
        <p>{data.copies.length} copias</p>
        <FormSheet action="Crear" resource="enlace" open={Boolean(enlace)}>
          <form action={`/api/admin/organismos/${id}/enlace`} method="post" className="grid gap-3">
            <select name="sector_id">
              {data.sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
            <SessionPick sessions={data.sessions} />
            <SheetSubmit>Copiar enlace del evento</SheetSubmit>
          </form>
        </FormSheet>
      </div>
    );
  }
  return <OrganismoLogoTab id={id} logo={data.logo} />;
}
