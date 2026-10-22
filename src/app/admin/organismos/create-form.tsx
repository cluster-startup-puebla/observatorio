import { ColorField } from "@/components/admin/color-field";
import { LogoField } from "@/components/admin/logo-field";
import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function CreateOrganismoForm({
  open,
  error,
  name,
  color,
}: {
  open?: boolean;
  error?: string;
  name?: string;
  color?: string;
}) {
  return (
    <FormSheet action="Crear" resource="organismo" label="Nuevo organismo" open={open}>
      <form action="/api/admin/organismos" method="post" encType="multipart/form-data" className="grid gap-3">
        {error ? <p className="text-small text-mark">{error}</p> : null}
        <label className="grid gap-1 text-small" htmlFor="org-name">
          Nombre
          <input id="org-name" name="name" defaultValue={name} required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <ColorField id="org-color" name="brand_color" defaultValue={color} />
        <LogoField />
        <SheetSubmit>Crear organismo</SheetSubmit>
      </form>
    </FormSheet>
  );
}
