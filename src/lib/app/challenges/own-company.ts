import "server-only";

import { readSessionAccount } from "@/lib/auth/session-account";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";

export async function empresarioCompanyDb() {
  const account = await readSessionAccount();
  const token = await readAccessToken();
  if (!account || account.role !== "empresario" || !token) return null;
  const db = createSupabaseWithAccess(token);
  const company = await db
    .from("companies")
    .select("id, sector_id, legal_name")
    .eq("profile_id", account.id)
    .maybeSingle();
  if (company.error || !company.data) return null;
  return { account, db, company: company.data };
}
