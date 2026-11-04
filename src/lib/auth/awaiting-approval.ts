import "server-only";

import { externalPassPending } from "@/lib/onboarding/external-pass-state";
import { linkPassPending } from "@/lib/onboarding/link-pass-state";

export async function awaitingSessionApproval(input: {
  token: string;
  email: string;
  profileId: string;
}) {
  try {
    if (input.email && (await linkPassPending(input.token, input.email))) return true;
    return await externalPassPending(input.token, input.profileId);
  } catch (error) {
    console.error("invite approval", error instanceof Error ? error.message : "error");
    return false;
  }
}
