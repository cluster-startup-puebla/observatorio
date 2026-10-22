import { ConfidentialityNote } from "@/components/onboarding/confidentiality-note";
import { ColorField } from "@/components/admin/color-field";
import { FileDrop } from "@/components/file-drop";
import { Field, controlClass } from "@/components/landing/molecules/field";
import { completeOrganismoAction } from "@/lib/account-actions";

export function OrganismoOnboarding({
  accountId,
  missingSlug,
}: {
  accountId: string;
  missingSlug?: boolean;
}) {
  return (
    <form action={completeOrganismoAction} className="grid gap-5">
      <ConfidentialityNote />
      <input type="hidden" name="accountId" value={accountId} />
      <Field id="nombre-organismo" label="Nombre del organismo">
        <input id="nombre-organismo" name="nombre" className={controlClass} />
      </Field>
      <Field id="slug-organismo" label="Enlace del panel">
        <input id="slug-organismo" name="slug" placeholder="coparmex-puebla" className={controlClass} />
      </Field>
      {missingSlug ? <p className="text-small text-mark">Ese enlace no está disponible.</p> : null}
      <ColorField id="color" name="color" />
      <FileDrop
        id="logo"
        name="logo"
        label="Logo"
        accept="image/png,image/jpeg"
        hint="PNG o JPG · hasta 2 MB"
        preview
      />
      <button type="button" className="btn btn-secondary" disabled>
        Copiar enlace del evento
      </button>
      <button type="submit" className="btn btn-primary">
        Terminar perfil
      </button>
    </form>
  );
}
