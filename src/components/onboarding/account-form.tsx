"use client";

import { useActionState } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { Field, controlClass } from "@/components/landing/molecules/field";
import { createAccountAction, type AccountFormState } from "@/lib/account-actions";

export function AccountForm({ sector, cuenta }: { sector?: string; cuenta?: string }) {
  const [state, action, pending] = useActionState<AccountFormState, FormData>(
    createAccountAction,
    null,
  );

  return (
    <form action={action} className="grid gap-5" noValidate>
      <input type="hidden" name="sector" value={sector ?? ""} />
      <input type="hidden" name="cuenta" value={cuenta ?? ""} />
      <Field id="correo" label="Correo" error={state?.errors.email}>
        <input id="correo" name="correo" type="email" autoComplete="email" className={controlClass} />
      </Field>
      <Field id="contrasena" label="Contraseña" error={state?.errors.password}>
        <PasswordInput id="contrasena" name="contrasena" label="contraseña" autoComplete="new-password" />
      </Field>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        Crear cuenta
      </button>
    </form>
  );
}
