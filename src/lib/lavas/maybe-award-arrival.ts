import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { awardLavas } from "./award";
import { LAVA_CODES } from "./codes";

export async function maybeAwardArrival(
  db: SupabaseClient,
  input: { companyId: string; profileId: string },
) {
  return awardLavas(db, {
    companyId: input.companyId,
    actionCode: LAVA_CODES.asistenciaLlego,
    refKey: input.profileId,
    origen: "live",
  });
}
