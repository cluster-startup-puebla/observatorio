import type { ChallengeStatus, ChallengeVisibility } from "./status";

export function isPortalVisible(row: {
  status: ChallengeStatus;
  visibility: ChallengeVisibility;
}) {
  return row.status === "publicado" && row.visibility === "portal";
}
