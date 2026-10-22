import { FormSheet } from "@/components/admin/form-sheet";

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
            <button className="btn btn-primary" type="submit">
              Copiar enlace del evento
            </button>
          </form>
        </FormSheet>
      </div>
    );
  }
  return (
    <div className="mt-4 grid gap-3">
      <p>{data.logo?.object_path ?? "Sin logo."}</p>
      <FormSheet action="Editar" resource="logo">
        <form action={`/api/admin/organismos/${id}/logo`} method="post" encType="multipart/form-data" className="grid gap-3">
          <input name="logo" type="file" accept="image/png,image/jpeg,image/webp" />
          <button className="btn btn-primary" type="submit">
            Subir logo
          </button>
        </form>
      </FormSheet>
    </div>
  );
}
