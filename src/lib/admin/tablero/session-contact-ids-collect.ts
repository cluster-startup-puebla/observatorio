import type { SupabaseClient } from "@supabase/supabase-js";

type Input = {
  profileIds: (string | null | undefined)[];
  emails: (string | null | undefined)[];
  orgIds: (string | null | undefined)[];
};

export async function collectSessionContactIds(db: SupabaseClient, input: Input) {
  const ids = new Set<string>();
  const profiles = [...new Set(input.profileIds.filter(Boolean))] as string[];
  const emails = [...new Set(input.emails.map((v) => String(v ?? "").trim().toLowerCase()).filter(Boolean))];
  const orgs = [...new Set(input.orgIds.filter(Boolean))] as string[];

  if (profiles.length > 0) {
    const byProfile = await db.from("crm_contacts").select("id").in("profile_id", profiles);
    if (byProfile.error) throw new Error(byProfile.error.message);
    for (const row of byProfile.data ?? []) ids.add(row.id);
  }
  if (emails.length > 0) {
    const byEmail = await db.from("crm_contacts").select("id").in("email", emails);
    if (byEmail.error) throw new Error(byEmail.error.message);
    for (const row of byEmail.data ?? []) ids.add(row.id);
  }
  if (orgs.length > 0) {
    const byOrg = await db.from("crm_contacts").select("id").in("organization_id", orgs);
    if (byOrg.error) throw new Error(byOrg.error.message);
    for (const row of byOrg.data ?? []) ids.add(row.id);
  }
  return ids;
}