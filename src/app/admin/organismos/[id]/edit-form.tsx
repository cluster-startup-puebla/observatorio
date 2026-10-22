import { ColorField } from "@/components/admin/color-field";
import { LogoField } from "@/components/admin/logo-field";
import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function EditOrganismoForm({
  id,
  name,
  color,
  open,
  error,
  trigger,
}: {
  id: string;
  name: string;
  color: string;
  open?: boolean;
  error?: string;
  trigger?: React.ReactNode;
}) {
  return (
    <FormSheet action="Editar" resource="organismo" open={open} trigger={trigger}>
      <form action={`/api/admin/organismos/${id}`} method="post" encType="multipart/form-data" className="grid gap-3">
        {error ? <p className="text-small text-mark">{error}</p> : null}
        <label className="grid gap-1 text-small" htmlFor={`edit-name-${id}`}>
          Nombre
          <input id={`edit-name-${id}`} name="name" defaultValue={name} required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <ColorField id={`edit-color-${id}`} name="brand_color" defaultValue={color} />
        <LogoField id={`edit-logo-${id}`} />
        <SheetSubmit>Guardar organismo</SheetSubmit>
      </form>
    </FormSheet>
  );
}
