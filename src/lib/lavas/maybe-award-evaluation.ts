import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { awardLavas } from "./award";
import { LAVA_CODES } from "./codes";

export function evaluationAwardRef(instrumentId: string) {
  return `eval:${instrumentId}`;
}

export async function maybeAwardEvaluation(
  db: SupabaseClient,
  input: {
    companyId: string;
    instrumentId: string;
    phase: string;
    scored: boolean;
  },
) {
  if (input.phase !== "done" || !input.scored) return { skipped: "not_done" as const };
  return awardLavas(db, {
    companyId: input.companyId,
    actionCode: LAVA_CODES.evaluacionTerminada,
    refKey: evaluationAwardRef(input.instrumentId),
    origen: "live",
  });
}
