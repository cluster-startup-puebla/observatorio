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
      <form action={`/api/admin/organismos/${id}/enlace`} method="post" className="mt-4 grid gap-3">
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
        {enlace ? <p data-testid="enlace-evento">{enlace}</p> : null}
        <p>{data.copies.length} copias</p>
      </form>
    );
  }
  return (
    <form action={`/api/admin/organismos/${id}/logo`} method="post" encType="multipart/form-data" className="mt-4 grid gap-3">
      <p>{data.logo?.object_path ?? "Sin logo."}</p>
      <input name="logo" type="file" accept="image/png,image/jpeg,image/webp" />
      <button className="btn btn-primary" type="submit">
        Subir logo
      </button>
    </form>
  );
}
