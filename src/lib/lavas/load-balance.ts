import "server-only";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";

export async function loadLavaBalance(accessToken: string, companyId: string) {
  const db = createSupabaseWithAccess(accessToken);
  const rows = await db.from("lava_ledger").select("amount").eq("company_id", companyId);
  if (rows.error) {
    console.error("lava balance", rows.error.message);
    return 0;
  }
  return (rows.data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}
