import { FormSheet } from "@/components/admin/form-sheet";

export function UploadForm({ orgs, open }: { orgs: { id: string; name: string }[]; open?: boolean }) {
  return (
    <FormSheet action="Crear" resource="invitaciones" open={open}>
    <form action="/api/admin/invitaciones" method="post" encType="multipart/form-data" className="grid gap-3">
      <label className="grid gap-1 text-small" htmlFor="organization_id">
        Organismo
        <select id="organization_id" name="organization_id" className="rounded-lg border border-line px-3 py-2">
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-small" htmlFor="archivo">
        Archivo de invitaciones
        <input id="archivo" name="archivo" type="file" accept=".csv,text/csv" />
      </label>
      <button className="btn btn-primary" type="submit">
        Subir plantilla
      </button>
    </form>
    </FormSheet>
  );
}
