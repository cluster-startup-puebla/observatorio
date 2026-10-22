"use client";

import { FormSheet } from "@/components/admin/form-sheet";
import { OrgCombobox } from "@/components/admin/org-combobox";
import { SheetSubmit } from "@/components/admin/sheet-submit";
import { PasswordInput } from "@/components/auth/password-input";

export function StaffForm({ orgs, error }: { orgs: { id: string; name: string }[]; error: string }) {
  return (
    <FormSheet action="Crear" resource="cuenta" label="Nueva cuenta" open={Boolean(error)}>
      <form action="/api/admin/cuentas" method="post" className="grid gap-3">
        {error ? <p className="text-small text-mark">{error}</p> : null}
        <label className="grid gap-1 text-small text-ink" htmlFor="email">
          Correo
          <input id="email" name="email" type="email" className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="grid gap-1 text-small text-ink" htmlFor="password">
          Contraseña
          <PasswordInput id="password" name="password" label="contraseña" autoComplete="new-password" />
        </label>
        <label className="grid gap-1 text-small text-ink" htmlFor="role">
          Rol
          <select id="role" name="role" className="rounded-lg border border-line px-3 py-2">
            <option value="moderador">Moderador</option>
            <option value="capturista">Capturista</option>
            <option value="invitador">Invitador</option>
          </select>
        </label>
        <label className="grid gap-1 text-small text-ink" htmlFor="organization_id">
          Organismo
          <OrgCombobox id="organization_id" name="organization_id" orgs={orgs} />
        </label>
        <SheetSubmit>Crear cuenta de staff</SheetSubmit>
      </form>
    </FormSheet>
  );
}
