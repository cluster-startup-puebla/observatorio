"use client";

import { useActionState } from "react";
import { LogoFileField } from "@/components/app/logo-file-field";
import { PendingSubmit } from "@/components/auth/pending-submit";
import { Field, controlClass } from "@/components/landing/molecules/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ProfileGap } from "@/lib/home/profile-gaps";
import {
  saveProfileLogo,
  saveProfileWebsite,
  sendProfileVerification,
  type GapFormState,
} from "@/lib/home/save-profile-gaps";

const empty: GapFormState = null;

function GapAlert({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}

function LogoGapForm() {
  const [state, action] = useActionState(saveProfileLogo, empty);
  return (
    <form action={action} className="grid gap-3">
      <GapAlert error={state?.error} />
      <LogoFileField />
      <PendingSubmit idle="Guardar logo" pendingLabel="Guardando logo…" className="btn btn-primary w-fit" />
    </form>
  );
}

function WebsiteGapForm() {
  const [state, action] = useActionState(saveProfileWebsite, empty);
  return (
    <form action={action} className="grid gap-3">
      <GapAlert error={state?.error} />
      <Field id="profile-website" label="Sitio web">
        <input
          id="profile-website"
          name="website"
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="ejemplo.com"
          maxLength={200}
          className={controlClass}
          required
        />
      </Field>
      <PendingSubmit idle="Guardar sitio" pendingLabel="Guardando sitio…" className="btn btn-primary w-fit" />
    </form>
  );
}

function VerifyGapForm({ email }: { email: string }) {
  const [state, action] = useActionState(sendProfileVerification, empty);
  if (state?.sent) {
    return (
      <Alert>
        <AlertDescription>
          Enviamos un enlace a {email}. Ábrelo para confirmar la cuenta. Revisa la bandeja de correo no deseado.
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <form action={action} className="grid gap-3">
      <GapAlert error={state?.error} />
      <p className="text-body text-ink">{email}</p>
      <PendingSubmit idle="Enviar correo" pendingLabel="Enviando…" className="btn btn-primary w-fit" />
    </form>
  );
}

export function ProfileGapForm({ gap, email }: { gap: ProfileGap; email: string }) {
  if (gap.id === "logo") return <LogoGapForm />;
  if (gap.id === "website") return <WebsiteGapForm />;
  return <VerifyGapForm email={email} />;
}
