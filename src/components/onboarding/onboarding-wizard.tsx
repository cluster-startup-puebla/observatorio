import { AccessPass } from "@/components/onboarding/access-pass";
import { PendingNotice } from "@/components/onboarding/pending-notice";
import { EmpresarioForm } from "@/components/onboarding/empresario-form";
import { OrganismoOnboarding } from "@/components/onboarding/organismo-form";
import { ConfidentialityNote } from "@/components/onboarding/confidentiality-note";

export function OnboardingWizard({
  accountId,
  role,
  sectorSlug,
  sectorName,
  invitacion,
  onboarded,
  pending,
  formError,
  missingSlug,
  missingLogo,
  brandError,
}: {
  accountId: string;
  role: string;
  sectorSlug: string | null;
  sectorName: string | null;
  invitacion?: string;
  onboarded: boolean;
  pending?: boolean;
  formError?: string;
  missingSlug?: boolean;
  missingLogo?: boolean;
  brandError?: boolean;
}) {
  if (onboarded && role !== "director") {
    if (pending) {
      return (
        <div className="grid gap-4">
          <ConfidentialityNote />
          <PendingNotice />
        </div>
      );
    }
    return (
      <div className="grid gap-4">
        <ConfidentialityNote />
        <AccessPass code={accountId} />
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
        invitacion={invitacion}
        error={formError}
      />
    </div>
  );
}
