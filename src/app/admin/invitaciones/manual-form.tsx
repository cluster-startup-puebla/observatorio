import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function ManualInviteForm({
  open,
  orgs,
}: {
  open?: boolean;
  orgs: { id: string; name: string }[];
}) {
  return (
    <FormSheet action="Crear" resource="invitación" label="Nueva invitación" open={open}>
      <form action="/api/admin/invitaciones/manual" method="post" className="grid gap-3">
        <label className="grid gap-1 text-small">
          Organismo
          <select name="organization_id" required className="rounded-lg border border-line px-3 py-2">
            {orgs.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-small">
          Nombre
          <input name="nombre" required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="grid gap-1 text-small">
          Empresa
          <input name="empresa" required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="grid gap-1 text-small">
          Correo
          <input name="correo" type="email" required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <SheetSubmit>Crear invitación</SheetSubmit>
      </form>
    </FormSheet>
  );
}
