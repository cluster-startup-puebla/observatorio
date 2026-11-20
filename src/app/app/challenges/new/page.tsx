import { ChallengeEditor } from "@/components/app/challenges/challenge-editor";
import { emptyChallengeForm } from "@/components/app/challenges/challenge-defaults";
import { loadIdentity } from "@/lib/app/load-identity";

export const instant = false;

export default async function NewChallengePage() {
  const identity = await loadIdentity();
  return (
    <ChallengeEditor
      title="Nuevo reto"
      initial={emptyChallengeForm()}
      companyName={identity.company}
      logoUrl={identity.logoUrl}
    />
  );
}
