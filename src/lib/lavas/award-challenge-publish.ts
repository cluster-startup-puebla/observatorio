import "server-only";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";
import { awardLavas } from "./award";
import { LAVA_CODES } from "./codes";

/** Called from retos publish action after status becomes visible. Hide must NOT reverse. */
export async function awardLavasForChallengePublish(input: {
  accessToken: string;
  companyId: string;
  challengeId: string;
  origen?: "live" | "backfill";
}) {
  const db = createSupabaseWithAccess(input.accessToken);
  const result = await awardLavas(db, {
    companyId: input.companyId,
    actionCode: LAVA_CODES.retoPublicado,
    refKey: input.challengeId,
    origen: input.origen ?? "live",
  });
  if (!result.ok) return { skipped: result.reason };
  if (result.awarded === 0) return { skipped: "already" };
  return { awarded: result.awarded };
}
