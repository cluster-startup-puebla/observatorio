import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { LavaCode } from "./codes";

export type AwardOrigen = "live" | "backfill" | "manual";

export async function awardLavas(
  db: SupabaseClient,
  input: {
    companyId: string;
    actionCode: LavaCode;
    refKey: string;
    origen: AwardOrigen;
    note?: string;
    manualAmount?: number;
  },
) {
  const result = await db.rpc("award_lavas", {
    p_company_id: input.companyId,
    p_action_code: input.actionCode,
    p_ref_key: input.refKey,
    p_origen: input.origen,
    p_note: input.note ?? null,
    p_manual_amount: input.manualAmount ?? null,
  });
  if (result.error) {
    console.error("award_lavas", result.error.message);
    return { ok: false as const, reason: "rpc" };
  }
  const awarded = Number(result.data ?? 0);
  return { ok: true as const, awarded };
}
