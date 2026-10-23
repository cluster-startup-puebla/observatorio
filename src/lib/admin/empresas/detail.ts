import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { bandLabel } from "./band-label";
import { sectorSourceLabel } from "./sector-source";

export async function loadEmpresa(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const company = await db
    .from("companies")
    .select("id, legal_name, employee_band, sector_id, sector_source, profile_id, referral_source, show_logo_on_event")
    .eq("id", id)
    .maybeSingle();
  if (company.error) throw new Error(company.error.message);
  if (!company.data) return null;
  const [sector, answers, pass] = await Promise.all([
    db.from("sectors").select("name, slug").eq("id", company.data.sector_id).maybeSingle(),
    db.from("response_choices").select("question_id, option_value, rank").eq("profile_id", company.data.profile_id),
    db.from("passes").select("issued_at, image_asset_id").eq("profile_id", company.data.profile_id).maybeSingle(),
  ]);
  for (const result of [sector, answers, pass]) {
    if (result.error) throw new Error(result.error.message);
  }
  return {
    company: {
      ...company.data,
      employee_label: bandLabel(company.data.employee_band),
      source_label: sectorSourceLabel(company.data.sector_source),
    },
    sector: sector.data,
    answers: answers.data ?? [],
    pass: pass.data,
  };
}
