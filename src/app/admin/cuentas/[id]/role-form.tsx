const roles = ["superadmin", "moderador", "empresario", "director", "capturista", "invitador"];

export function RoleForm({
  id,
  role,
  organizationId,
  orgs,
}: {
  id: string;
  role: string;
  organizationId: string;
  orgs: { id: string; name: string | null }[];
}) {
  return (
    <form action={`/api/admin/cuentas/${id}`} method="post" className="grid max-w-md gap-3">
      <label className="grid gap-1 text-small" htmlFor="role">
        Rol
        <select id="role" name="role" defaultValue={role} className="rounded-lg border border-line px-3 py-2">
          {roles.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-small" htmlFor="organization_id">
        Organismo
        <select id="organization_id" name="organization_id" defaultValue={organizationId} className="rounded-lg border border-line px-3 py-2">
          <option value="">Ninguno</option>
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name ?? org.id}
            </option>
          ))}
        </select>
      </label>
      <button className="btn btn-primary" type="submit">
        Cambiar rol
      </button>
    </form>
  );
}
