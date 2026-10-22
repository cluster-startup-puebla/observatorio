import { ConfidentialityNote } from "@/components/onboarding/confidentiality-note";
import { OrgNameSlug } from "@/components/onboarding/org-name-slug";
import { ColorField } from "@/components/admin/color-field";
import { SheetSubmit } from "@/components/admin/sheet-submit";
import { FileDrop } from "@/components/file-drop";
import { completeOrganismoAction } from "@/lib/account-actions";

export function OrganismoOnboarding({
  accountId,
  missingSlug,
  missingLogo,
  brandError,
}: {
  accountId: string;
  missingSlug?: boolean;
  missingLogo?: boolean;
  brandError?: boolean;
}) {
  return (
    <form action={completeOrganismoAction} className="grid gap-5">
      <ConfidentialityNote />
      <input type="hidden" name="accountId" value={accountId} />
      <OrgNameSlug />
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
      {missingLogo ? (
        <p className="text-small text-mark">Sube un logo PNG o JPG de hasta 2 MB para continuar.</p>
      ) : null}
      {brandError ? (
        <p className="text-small text-mark">No se pudo guardar la marca. Intenta de nuevo.</p>
      ) : null}
      <SheetSubmit pendingLabel="Terminando…">Terminar perfil</SheetSubmit>
    </form>
  );
}
