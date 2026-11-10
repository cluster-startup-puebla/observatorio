"use client";

import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { controlClass, Field } from "@/components/landing/molecules/field";
import { requestPasswordReset, type ResetRequestState } from "@/lib/auth/request-password-reset";

const empty: ResetRequestState = null;

export function RecoverForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, empty);
  if (state?.ok) {
    return (
      <p className="text-body text-ink-secondary">
        Si ese correo está registrado, enviamos un enlace para restablecer la contraseña. Revisa la bandeja de correo no deseado.
      </p>
    );
  }

  return (
    <form action={action} noValidate className="grid gap-5">
      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Field id="correo" label="Correo">
        <input id="correo" name="correo" type="email" autoComplete="email" className={controlClass} />
      </Field>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        Enviar enlace
      </button>
    </form>
  );
}
