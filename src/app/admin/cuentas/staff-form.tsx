import { FormSheet } from "@/components/admin/form-sheet";

export function StaffForm({ orgs, error }: { orgs: { id: string; name: string }[]; error: string }) {
  return (
    <FormSheet action="Crear" resource="cuenta" open={Boolean(error)}>
    <form action="/api/admin/cuentas" method="post" className="grid gap-3">
      {error ? <p className="text-small text-mark">{error}</p> : null}
      <label className="grid gap-1 text-small text-ink" htmlFor="email">
        Correo
        <input id="email" name="email" type="email" className="rounded-lg border border-line px-3 py-2" />
      </label>
      <label className="grid gap-1 text-small text-ink" htmlFor="password">
        Contraseña
        <input id="password" name="password" type="password" className="rounded-lg border border-line px-3 py-2" />
      </label>
      <label className="grid gap-1 text-small text-ink" htmlFor="role">
        Rol
        <select id="role" name="role" className="rounded-lg border border-line px-3 py-2">
          <option value="moderador">Moderador</option>
          <option value="capturista">Capturista</option>
          <option value="invitador">Invitador</option>
        </select>
      </label>
      <label className="grid gap-1 text-small text-ink" htmlFor="organization_id">
        Organismo
        <select id="organization_id" name="organization_id" className="rounded-lg border border-line px-3 py-2">
          <option value="">Ninguno</option>
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </label>
      <button className="btn btn-primary" type="submit">
        Crear cuenta de staff
      </button>
    </form>
    </FormSheet>
  );
}
