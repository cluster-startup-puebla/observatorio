/**
 * Stub until the lavas plan ships a real award.
 * Replace on merge with docs/superpowers/plans/2026-11-20-lavas.md.
 * Hiding a challenge must not reverse lavas.
 */
export async function awardLavasForChallengePublish(_input: {
  companyId: string;
  challengeId: string;
  origen: "live" | "backfill";
}) {
  return { skipped: "lavas-not-ready" as const };
}
