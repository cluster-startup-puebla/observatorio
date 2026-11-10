"use client";

import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { resendConfirmationAction, type ResendState } from "@/lib/auth/resend-confirmation-action";

const empty: ResendState = { sent: false, error: "" };

export function ResendConfirmationForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(resendConfirmationAction, empty);
  if (state.sent) {
    return (
      <Alert>
        <AlertDescription>
          Si ese correo está pendiente, enviamos otro enlace para confirmarlo. Revisa la bandeja de correo no deseado.
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <form action={action} className="grid gap-5">
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <p className="text-body text-ink">{email}</p>
      <input type="hidden" name="correo" value={email} />
      <button type="submit" className="btn btn-primary" disabled={pending}>
        Reenviar correo
      </button>
    </form>
  );
}
