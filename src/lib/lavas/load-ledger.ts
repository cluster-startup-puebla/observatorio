import "server-only";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";

export async function loadLavaLedger(accessToken: string, companyId: string, limit = 40) {
  const db = createSupabaseWithAccess(accessToken);
  const rows = await db
    .from("lava_ledger")
    .select("id, action_code, amount, origen, created_at, note")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (rows.error) {
    console.error("lava ledger", rows.error.message);
    return [];
  }
  return rows.data ?? [];
}
