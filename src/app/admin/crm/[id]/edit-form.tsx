"use client";

import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function EditCrmForm({
  id,
  nombre,
  empresa,
  email,
  open,
  trigger,
}: {
  id: string;
  nombre: string;
  empresa: string;
  email: string;
  open?: boolean;
  trigger?: React.ReactNode;
}) {
  return (
    <FormSheet action="Editar" resource="contacto" open={open} trigger={trigger}>
      <form action={`/api/admin/crm/${id}`} method="post" className="grid gap-3">
        <input type="hidden" name="accion" value="guardar" />
        <label className="grid gap-1 text-small">
          Nombre
          <input name="nombre" defaultValue={nombre} required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="grid gap-1 text-small">
          Empresa
          <input name="empresa" defaultValue={empresa} required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="grid gap-1 text-small">
          Correo
          <input name="correo" type="email" defaultValue={email} required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <SheetSubmit>Guardar contacto</SheetSubmit>
      </form>
    </FormSheet>
  );
}
