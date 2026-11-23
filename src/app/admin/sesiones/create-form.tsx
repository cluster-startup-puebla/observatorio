import { SessionFields } from "@/app/admin/sesiones/session-fields";
import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function CreateSessionForm({
  open,
  sectors,
  instruments,
}: {
  open?: boolean;
  sectors: { id: string; name: string; slug: string }[];
  instruments: { id: string; label: string }[];
}) {
  return (
    <FormSheet action="Crear" resource="sesión" label="Nueva sesión" open={open}>
      <form action="/api/admin/sesiones" method="post" className="grid gap-3">
        <SessionFields sectors={sectors} instruments={instruments} />
        <SheetSubmit>Crear sesión</SheetSubmit>
      </form>
    </FormSheet>
  );
}
