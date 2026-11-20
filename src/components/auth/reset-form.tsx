"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/auth/password-input";
import { Field } from "@/components/landing/molecules/field";
import { saveResetPassword, type ResetSaveState } from "@/lib/auth/save-reset-password";
import { ActionButton } from "@/components/ui/action-button";
import { recoveryHash, recoveryStoreKey, storedRecovery } from "@/lib/auth/recovery-link";

const empty: ResetSaveState = null;

export function ResetForm({ signedIn }: { signedIn: boolean }) {
  const [tokens, setTokens] = useState<{ access: string; refresh: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [state, action] = useActionState(saveResetPassword, empty);

  useEffect(() => {
    const fromHash = recoveryHash(window.location.hash);
    const found = fromHash ?? storedRecovery(sessionStorage.getItem(recoveryStoreKey));
    if (fromHash) {
      sessionStorage.setItem(recoveryStoreKey, JSON.stringify(fromHash));
      window.history.replaceState(null, "", window.location.pathname);
    }
    if (found) setTokens(found);
    setReady(true);
  }, []);

  if (!ready) return null;
  if (!tokens) {
    if (signedIn) {
      return (
        <p className="text-body text-ink-secondary">
          Ya tienes sesión. <Link href="/" className="text-link">Seguir al inicio</Link>
        </p>
      );
    }
    return (
      <Alert variant="destructive">
        <AlertDescription>El enlace no es válido o ya venció. Pide otro desde recuperar contraseña.</AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={action} className="grid gap-5" onSubmit={() => sessionStorage.removeItem(recoveryStoreKey)}>
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
      <ActionButton pendingLabel="Guardando…">Guardar contraseña</ActionButton>
    </form>
  );
}
