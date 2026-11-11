import { AccessPass } from "@/components/onboarding/access-pass";
import { LaterLogoForm } from "@/components/onboarding/later-logo-form";
import { PendingNotice } from "@/components/onboarding/pending-notice";
import { ConfidentialityNote } from "@/components/onboarding/confidentiality-note";

export function FinishedProfile({
  accountId,
  gate,
  offerLogo = false,
  logoError,
}: {
  accountId: string;
  gate: "espera" | "cerrado" | "cancelo" | "pase";
  offerLogo?: boolean;
  logoError?: string;
}) {
  const logo = offerLogo ? <LaterLogoForm error={logoError} /> : null;
  if (gate === "cancelo") return <ConfidentialityNote />;
  if (gate === "cerrado") {
    return (
      <div className="grid gap-4">
        <ConfidentialityNote />
        <p data-testid="pase-cancelado" className="text-body text-ink">
          Tu lugar no sigue apartado.
        </p>
      </div>
    );
  }
  if (gate === "espera") {
    return (
      <div className="grid gap-4">
        <ConfidentialityNote />
        <PendingNotice />
        {logo}
      </div>
    );
  }
  return (
    <div className="grid gap-4">
      <ConfidentialityNote />
      <AccessPass code={accountId} />
      {logo}
    </div>
  );
}
