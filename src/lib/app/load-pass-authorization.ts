import "server-only";

import { sessionPassAllowed } from "@/lib/app/session-pass-allowed";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";

export async function loadPassAuthorization(token: string, profileId: string, email: string) {
  const db = createSupabaseWithAccess(token);
  const mail = email.trim().toLowerCase();
  const [company, contacts] = await Promise.all([
    db.from("companies").select("admitted_at").eq("profile_id", profileId).maybeSingle(),
    mail
      ? db.from("crm_contacts").select("id").eq("email", mail)
      : Promise.resolve({ data: [] as { id: string }[], error: null }),
  ]);
  if (company.error) throw new Error(company.error.message);
  if (contacts.error) throw new Error(contacts.error.message);
  const ids = (contacts.data ?? []).map((row) => row.id);
  const statuses = ids.length
    ? await db.from("crm_contact_status").select("status").in("contact_id", ids)
    : { data: [] as { status: string | null }[], error: null };
  if (statuses.error) throw new Error(statuses.error.message);
  return sessionPassAllowed({
    admittedAt: typeof company.data?.admitted_at === "string" ? company.data.admitted_at : null,
    crmStatuses: (statuses.data ?? []).map((row) => row.status),
  });
}
