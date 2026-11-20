import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { awardLavas } from "./award";
import { LAVA_CODES } from "./codes";

/** Called from retos publish after status is visible. Hide must NOT reverse. */
export async function awardLavasForChallengePublish(input: {
  db: SupabaseClient;
  companyId: string;
  challengeId: string;
  origen?: "live" | "backfill";
}) {
  const result = await awardLavas(input.db, {
    companyId: input.companyId,
    actionCode: LAVA_CODES.retoPublicado,
    refKey: input.challengeId,
    origen: input.origen ?? "live",
  });
  if (!result.ok) return { skipped: result.reason };
  if (result.awarded === 0) return { skipped: "already" };
  return { awarded: result.awarded };
}
