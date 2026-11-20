"use client";

import { useActionState } from "react";
import { PendingSubmit } from "@/components/auth/pending-submit";
import { Field, controlClass } from "@/components/landing/molecules/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ProfileGap } from "@/lib/home/profile-gaps";
import { saveProfileLogo, saveProfileWebsite, type GapFormState } from "@/lib/home/save-profile-gaps";

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
      <Field id="profile-logo" label="Logo">
        <input
          id="profile-logo"
          name="logo"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className={controlClass}
          required
        />
      </Field>
      <p className="text-small text-ink-secondary">PNG, JPG o WEBP · hasta 2 MB.</p>
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

export function ProfileGapForms({ gaps }: { gaps: ProfileGap[] }) {
  return (
    <div className="mt-6 grid gap-6">
      {gaps.map((gap) =>
        gap.id === "logo" ? <LogoGapForm key={gap.id} /> : <WebsiteGapForm key={gap.id} />,
      )}
    </div>
  );
}
