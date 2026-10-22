"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/auth/password-input";
import { Field, controlClass } from "@/components/landing/molecules/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createAccountAction, type AccountFormState } from "@/lib/account-actions";
import { registerError } from "@/lib/organismo/register-error";

export function AccountForm({
  sector,
  cuenta,
  error = "",
}: {
  sector?: string;
  cuenta?: string;
  error?: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<AccountFormState, FormData>(
    createAccountAction,
    null,
  );
  const notice = state?.error ? registerError(state.error) : error;

  useEffect(() => {
    if (state?.next) router.push(state.next);
  }, [router, state]);

  return (
    <form action={action} className="grid gap-5" noValidate>
      {notice ? (
        <Alert variant="destructive">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}
      <input type="hidden" name="sector" value={sector ?? ""} />
      <input type="hidden" name="cuenta" value={cuenta ?? ""} />
      <Field id="correo" label="Correo" error={state?.errors?.email}>
        <input id="correo" name="correo" type="email" autoComplete="email" className={controlClass} />
      </Field>
      <Field id="contrasena" label="Contraseña" error={state?.errors?.password}>
        <PasswordInput id="contrasena" name="contrasena" label="contraseña" autoComplete="new-password" />
      </Field>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        Crear cuenta
      </button>
    </form>
  );
}
