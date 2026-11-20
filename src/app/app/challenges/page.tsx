import { ChallengeList } from "@/components/app/challenges/challenge-list";
import { loadMyChallenges } from "@/lib/app/challenges/load-mine";

export const instant = false;

export default async function ChallengesPage() {
  const rows = await loadMyChallenges();
  return <ChallengeList rows={rows} />;
}
