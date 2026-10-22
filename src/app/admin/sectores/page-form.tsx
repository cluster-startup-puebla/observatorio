"use client";

import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function SectorPageForm({
  id,
  name,
  headline,
  body,
  open,
  trigger,
}: {
  id: string;
  name: string;
  headline: string;
  body: string;
  open?: boolean;
  trigger?: React.ReactNode;
}) {
  return (
    <FormSheet action="Editar" resource="página" open={open} trigger={trigger} label={trigger ? undefined : `Página · ${name}`}>
      <form action={`/api/admin/sectores/${id}`} method="post" className="grid gap-3">
        <input type="hidden" name="accion" value="pagina" />
        <label className="grid gap-1 text-small" htmlFor={`headline-${id}`}>
          Titular
          <input id={`headline-${id}`} name="headline" defaultValue={headline} className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="grid gap-1 text-small" htmlFor={`body-${id}`}>
          Cuerpo
          <textarea id={`body-${id}`} name="body" defaultValue={body} rows={5} className="rounded-lg border border-line px-3 py-2" />
        </label>
        <SheetSubmit>Guardar página</SheetSubmit>
      </form>
    </FormSheet>
  );
}
