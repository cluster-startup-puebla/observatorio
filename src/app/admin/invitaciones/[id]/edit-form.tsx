"use client";

import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function EditInvitacionForm({
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
    <FormSheet action="Editar" resource="invitación" open={open} trigger={trigger}>
      <form action={`/api/admin/invitaciones/${id}`} method="post" className="grid gap-3">
        <input type="hidden" name="accion" value="guardar" />
        <label className="grid gap-1 text-small" htmlFor={`inv-nombre-${id}`}>
          Nombre
          <input id={`inv-nombre-${id}`} name="nombre" defaultValue={nombre} className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="grid gap-1 text-small" htmlFor={`inv-empresa-${id}`}>
          Empresa
          <input id={`inv-empresa-${id}`} name="empresa" defaultValue={empresa} className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="grid gap-1 text-small" htmlFor={`inv-correo-${id}`}>
          Correo
          <input id={`inv-correo-${id}`} name="correo" type="email" defaultValue={email} className="rounded-lg border border-line px-3 py-2" />
        </label>
        <SheetSubmit>Guardar invitación</SheetSubmit>
      </form>
    </FormSheet>
  );
}
