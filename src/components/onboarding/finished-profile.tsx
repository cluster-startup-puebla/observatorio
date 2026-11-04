import { AccessPass } from "@/components/onboarding/access-pass";
import { PendingNotice } from "@/components/onboarding/pending-notice";
import { ConfidentialityNote } from "@/components/onboarding/confidentiality-note";

export function FinishedProfile({
  accountId,
  gate,
}: {
  accountId: string;
  gate: "espera" | "cerrado" | "cancelo" | "pase";
}) {
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
