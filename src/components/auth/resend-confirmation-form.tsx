"use client";

import { useActionState } from "react";
import { controlClass, Field } from "@/components/landing/molecules/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { resendConfirmationAction, type ResendState } from "@/lib/auth/resend-confirmation-action";

const empty: ResendState = { sent: false, error: "" };

export function ResendConfirmationForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(resendConfirmationAction, empty);
  if (state.sent) {
    return (
      <Alert>
        <AlertDescription>Si ese correo está pendiente, enviamos otro enlace para confirmarlo.</AlertDescription>
      </Alert>
    );
  }
  return (
    <form action={action} noValidate className="grid gap-5">
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Field id="correo" label="Correo">
        <input
          id="correo"
          name="correo"
          type="email"
          autoComplete="email"
          defaultValue={email}
          className={controlClass}
        />
      </Field>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        Reenviar correo
      </button>
    </form>
  );
}
