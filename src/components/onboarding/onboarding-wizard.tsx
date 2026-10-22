import { EmpresarioForm } from "@/components/onboarding/empresario-form";
import { OrganismoOnboarding } from "@/components/onboarding/organismo-form";
import { ConfidentialityNote } from "@/components/onboarding/confidentiality-note";

export function OnboardingWizard({
  accountId,
  role,
  sectorSlug,
  sectorName,
  sectorLocked,
  invitacion,
  onboarded,
  formError,
  missingSlug,
  missingLogo,
  brandError,
}: {
  accountId: string;
  role: string;
  sectorSlug: string | null;
  sectorName: string | null;
  sectorLocked: boolean;
  invitacion?: string;
  onboarded: boolean;
  formError?: string;
  missingSlug?: boolean;
  missingLogo?: boolean;
  brandError?: boolean;
}) {
  if (onboarded && role !== "director") {
    return (
      <div className="grid gap-4">
        <ConfidentialityNote />
        <p data-testid="qr-listo" className="text-h3 text-ink">
          Tu pase quedó listo.
        </p>
      </div>
    );
  }

  if (role === "director") {
    return (
      <OrganismoOnboarding
        accountId={accountId}
        missingSlug={missingSlug}
        missingLogo={missingLogo}
        brandError={brandError}
      />
    );
  }

  return (
    <div className="grid gap-4">
      {sectorName ? (
        <p data-testid="sector-elegido" className="text-small text-ink-secondary">
          Industria sugerida: {sectorName}
        </p>
      ) : null}
      <EmpresarioForm
        accountId={accountId}
        sectorSlug={sectorSlug}
        sectorLocked={sectorLocked}
        invitacion={invitacion}
        error={formError}
      />
    </div>
  );
}
