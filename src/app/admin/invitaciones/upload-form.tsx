import { FormSheet } from "@/components/admin/form-sheet";
import { FileDrop } from "@/components/file-drop";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function UploadForm({ orgs, open }: { orgs: { id: string; name: string }[]; open?: boolean }) {
  return (
    <FormSheet action="Crear" resource="plantilla" label="Subir plantilla" open={open}>
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
      <FileDrop
        id="archivo"
        name="archivo"
        label="Archivo de invitaciones"
        accept=".csv,text/csv"
        hint="CSV con nombre, empresa y correo"
      />
      <SheetSubmit>Subir plantilla</SheetSubmit>
    </form>
    </FormSheet>
  );
}
