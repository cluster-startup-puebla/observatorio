"use client";

import { FormSheet } from "@/components/admin/form-sheet";
import { OrgCombobox } from "@/components/admin/org-combobox";
import { SheetSubmit } from "@/components/admin/sheet-submit";

const roles = ["superadmin", "moderador", "empresario", "director", "capturista", "invitador"];

export function RoleForm({
  id,
  role,
  organizationId,
  fullName,
  jobTitle,
  whatsapp,
  orgs,
  open,
  trigger,
}: {
  id: string;
  role: string;
  organizationId: string;
  fullName: string;
  jobTitle: string;
  whatsapp: string;
  orgs: { id: string; name: string | null }[];
  open?: boolean;
  trigger?: React.ReactNode;
}) {
  return (
    <FormSheet action="Editar" resource="cuenta" open={open} trigger={trigger}>
    <form action={`/api/admin/cuentas/${id}`} method="post" className="grid gap-3">
      <label className="grid gap-1 text-small" htmlFor="full_name">
        Nombre
        <input id="full_name" name="full_name" defaultValue={fullName} className="rounded-lg border border-line px-3 py-2" />
      </label>
      <label className="grid gap-1 text-small" htmlFor="job_title">
        Puesto
        <input id="job_title" name="job_title" defaultValue={jobTitle} className="rounded-lg border border-line px-3 py-2" />
      </label>
      <label className="grid gap-1 text-small" htmlFor="whatsapp">
        WhatsApp
        <input id="whatsapp" name="whatsapp" defaultValue={whatsapp} className="rounded-lg border border-line px-3 py-2" />
      </label>
      <label className="grid gap-1 text-small" htmlFor="role">
        Rol
        <select id="role" name="role" defaultValue={role} className="rounded-lg border border-line px-3 py-2">
          {roles.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-small" htmlFor="organization_id">
        Organismo
        <OrgCombobox id="organization_id" name="organization_id" orgs={orgs} defaultValue={organizationId} />
      </label>
      <SheetSubmit>Guardar cuenta</SheetSubmit>
    </form>
    </FormSheet>
  );
}
