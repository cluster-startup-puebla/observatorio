import { ChallengeEditor } from "@/components/app/challenges/challenge-editor";
import { emptyChallengeForm } from "@/components/app/challenges/challenge-defaults";

export const instant = false;

export default function NewChallengePage() {
  return (
    <ChallengeEditor
      title="Nuevo reto"
      initial={emptyChallengeForm()}
    />
  );
}
