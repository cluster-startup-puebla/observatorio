import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function CreateSessionForm({ open }: { open?: boolean }) {
  return (
    <FormSheet action="Crear" resource="sesión" open={open}>
    <form action="/api/admin/sesiones" method="post" className="grid gap-3">
      <input name="venue" placeholder="Lugar" required />
      <input name="format_name" placeholder="Formato" required />
      <input name="starts_local" type="time" required />
      <input name="ends_local" type="time" required />
      <input name="capacity_min" type="number" min={1} defaultValue={8} />
      <input name="capacity_max" type="number" min={1} defaultValue={12} />
      <input name="audience" placeholder="Público" required />
      <input name="includes" placeholder="Incluye" required />
      <SheetSubmit>Crear sesión</SheetSubmit>
    </form>
    </FormSheet>
  );
}
