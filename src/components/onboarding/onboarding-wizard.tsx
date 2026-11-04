import { EmpresarioForm } from "@/components/onboarding/empresario-form";
import { FinishedProfile } from "@/components/onboarding/finished-profile";
import { OrganismoOnboarding } from "@/components/onboarding/organismo-form";

export function OnboardingWizard({
  accountId,
  role,
  sectorSlug,
  sectorName,
  invitacion,
  onboarded,
  pending,
  gate,
  formError,
  missingSlug,
  missingLogo,
  brandError,
  termsError,
}: {
  accountId: string;
  role: string;
  sectorSlug: string | null;
  sectorName: string | null;
  invitacion?: string;
  onboarded: boolean;
  pending?: boolean;
  gate?: "espera" | "cerrado" | "cancelo" | "pase";
  formError?: string;
  missingSlug?: boolean;
  missingLogo?: boolean;
  brandError?: boolean;
  termsError?: boolean;
}) {
  if (onboarded && role !== "director") {
    const shown = gate ?? (pending ? "espera" : "pase");
    return <FinishedProfile accountId={accountId} gate={shown} />;
  }

  if (role === "director") {
    return (
      <OrganismoOnboarding
        accountId={accountId}
        missingSlug={missingSlug}
        missingLogo={missingLogo}
        brandError={brandError}
        termsError={termsError}
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
