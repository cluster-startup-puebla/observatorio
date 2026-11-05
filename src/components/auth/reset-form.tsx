"use client";

import { useActionState, useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/auth/password-input";
import { Field } from "@/components/landing/molecules/field";
import { saveResetPassword, type ResetSaveState } from "@/lib/auth/save-reset-password";
import { recoveryHash } from "@/lib/auth/recovery-link";

const empty: ResetSaveState = null;

export function ResetForm() {
  const [tokens, setTokens] = useState<{ access: string; refresh: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [state, action, pending] = useActionState(saveResetPassword, empty);

  useEffect(() => {
    const found = recoveryHash(window.location.hash);
    if (found) {
      setTokens(found);
      window.history.replaceState(null, "", window.location.pathname);
    }
    setReady(true);
  }, []);

  if (!ready) return null;
  if (!tokens) {
    return (
      <Alert variant="destructive">
        <AlertDescription>El enlace no es válido o ya venció. Pide otro desde recuperar contraseña.</AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={action} className="grid gap-5">
      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <input type="hidden" name="access" value={tokens.access} />
      <input type="hidden" name="refresh" value={tokens.refresh} />
      <Field id="contrasena" label="Nueva contraseña">
        <PasswordInput id="contrasena" name="contrasena" label="nueva contraseña" autoComplete="new-password" />
      </Field>
      <Field id="confirmar" label="Confirmar contraseña">
        <PasswordInput id="confirmar" name="confirmar" label="confirmación" autoComplete="new-password" />
      </Field>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        Guardar contraseña
      </button>
    </form>
  );
}
