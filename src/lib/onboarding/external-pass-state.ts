import "server-only";
import { waitsForExternalApproval } from "@/lib/admin/empresas/external-approval";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";

export async function externalPassPending(accessToken: string, profileId: string) {
  const company = await createSupabaseWithAccess(accessToken)
    .from("companies")
    .select("sector_source, admitted_at")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (company.error) throw new Error(company.error.message);
  if (!company.data) return false;
  return waitsForExternalApproval(company.data.sector_source, company.data.admitted_at);
}
