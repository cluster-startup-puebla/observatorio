import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function CreateSectorForm({ open }: { open?: boolean }) {
  return (
    <FormSheet action="Crear" resource="sector" label="Nuevo sector" open={open}>
      <form action="/api/admin/sectores" method="post" className="grid gap-3">
        <label className="grid gap-1 text-small" htmlFor="sector-name">
          Nombre
          <input id="sector-name" name="name" required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="grid gap-1 text-small" htmlFor="sector-slug">
          Ruta
          <input id="sector-slug" name="slug" required pattern="[a-z0-9-]+" className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="grid gap-1 text-small" htmlFor="sector-position">
          Orden
          <input id="sector-position" name="position" type="number" min={1} required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <SheetSubmit>Crear sector</SheetSubmit>
      </form>
    </FormSheet>
  );
}
