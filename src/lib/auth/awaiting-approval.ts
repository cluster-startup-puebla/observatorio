import "server-only";

import { externalPassPending } from "@/lib/onboarding/external-pass-state";
import { linkPassPending } from "@/lib/onboarding/link-pass-state";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";
import { holdsSession } from "./session-hold";

async function seatCancelled(token: string) {
  const state = await createSupabaseWithAccess(token).rpc("my_attendance_state");
  return state.data === "cancelo";
}

export async function awaitingSessionApproval(input: {
  token: string;
  email: string;
  profileId: string;
}) {
  try {
    const cancelled = await seatCancelled(input.token);
    const linkPending = Boolean(input.email) && (await linkPassPending(input.token, input.email));
    const externalPending = await externalPassPending(input.token, input.profileId);
    return holdsSession({ cancelled, linkPending, externalPending });
  } catch (error) {
    console.error("invite approval", error instanceof Error ? error.message : "error");
    return false;
  }
}
