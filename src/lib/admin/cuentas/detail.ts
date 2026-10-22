import "server-only";

import { adminDb } from "@/lib/admin/admin-db";

export async function loadCuenta(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const profile = await db
    .from("profiles")
    .select("id, full_name, email, role, job_title, whatsapp, organization_id, onboarded_at")
    .eq("id", id)
    .maybeSingle();
  if (profile.error) throw new Error(profile.error.message);
  if (!profile.data) return null;
  const [company, pass, answers, mail, orgs] = await Promise.all([
    db.from("companies").select("legal_name, employee_band, sector_id").eq("profile_id", id).maybeSingle(),
    db.from("passes").select("profile_id, issued_at, image_asset_id").eq("profile_id", id).maybeSingle(),
    db.from("response_choices").select("question_id, option_value, rank").eq("profile_id", id),
    db.from("outbox_messages").select("id, kind, subject, to_email, created_at").eq("profile_id", id),
    db.from("organizations").select("id, name").order("name"),
  ]);
  for (const result of [company, pass, answers, mail, orgs]) {
    if (result.error) throw new Error(result.error.message);
  }
  return {
    profile: profile.data,
    company: company.data,
    pass: pass.data,
    answers: answers.data ?? [],
    mail: mail.data ?? [],
    orgs: orgs.data ?? [],
  };
}
