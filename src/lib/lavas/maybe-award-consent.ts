import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { awardLavas } from "./award";
import { LAVA_CODES } from "./codes";

export async function maybeAwardConsent(
  db: SupabaseClient,
  input: { companyId: string; profileId: string },
) {
  return awardLavas(db, {
    companyId: input.companyId,
    actionCode: LAVA_CODES.innovacionAceptada,
    refKey: input.profileId,
    origen: "live",
  });
}
