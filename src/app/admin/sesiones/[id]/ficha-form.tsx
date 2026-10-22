import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

type SessionFields = {
  venue: string;
  format_name: string;
  starts_local: string;
  ends_local: string;
  capacity_min: number;
  capacity_max: number;
  audience: string;
  includes: string;
  is_current: boolean;
};

export function FichaForm({ id, session, open }: { id: string; session: SessionFields; open?: boolean }) {
  return (
    <FormSheet action="Editar" resource="sesión" open={open}>
    <form action={`/api/admin/sesiones/${id}`} method="post" className="grid gap-3">
      <input name="venue" defaultValue={session.venue} />
      <input name="format_name" defaultValue={session.format_name} />
      <input name="starts_local" type="time" defaultValue={session.starts_local} />
      <input name="ends_local" type="time" defaultValue={session.ends_local} />
      <input name="capacity_min" type="number" defaultValue={session.capacity_min} />
      <input name="capacity_max" type="number" defaultValue={session.capacity_max} />
      <input name="audience" defaultValue={session.audience} />
      <input name="includes" defaultValue={session.includes} />
      <label>
        <input name="is_current" type="checkbox" defaultChecked={session.is_current} /> Vigente
      </label>
      <SheetSubmit>Guardar sesión</SheetSubmit>
    </form>
    </FormSheet>
  );
}
