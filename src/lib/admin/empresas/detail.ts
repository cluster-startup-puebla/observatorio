import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { bandLabel } from "./band-label";
import { acceptorLabel, externalApprovalLabel } from "./external-approval";
import { convenerLinks } from "./convener";
import { loadLinkContacts } from "./link-contacts";
import { sectorSourceLabel } from "./sector-source";

export async function loadEmpresa(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const company = await db
    .from("companies")
    .select("id, legal_name, employee_band, sector_id, sector_source, profile_id, referral_source, show_logo_on_event, admitted_at, admitted_by")
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
  const admitter = company.data.admitted_by
    ? await db.from("profiles").select("email").eq("id", company.data.admitted_by).maybeSingle()
    : { data: null, error: null };
  if (admitter.error) throw new Error(admitter.error.message);
  const owner = await db.from("profiles").select("full_name, email, role").eq("id", company.data.profile_id).maybeSingle();
  if (owner.error) throw new Error(owner.error.message);
  const email = String(owner.data?.email ?? "").trim().toLowerCase();
  const links = await loadLinkContacts(db, email ? [email] : []);
  const convener = links.convened.get(email) ?? "";
  const statuses = links.statuses.get(email) ?? [];
  return {
    company: {
      ...company.data,
      employee_label: bandLabel(company.data.employee_band),
      source_label: sectorSourceLabel(company.data.sector_source),
      admitted_at: company.data.admitted_at,
      approval_label: externalApprovalLabel(company.data.sector_source, company.data.admitted_at, statuses),
      admitted_by_email: admitter.data?.email ?? "",
      acceptor: acceptorLabel(convener, company.data.sector_source, admitter.data?.email ?? ""),
      has_link: links.convened.has(email),
      conveners: convenerLinks(links.hrefs.get(email)),
      member: {
        id: company.data.profile_id,
        name: String(owner.data?.full_name ?? ""),
        email,
        role: String(owner.data?.role ?? ""),
      },
    },
    sector: sector.data,
    answers: answers.data ?? [],
    pass: pass.data,
  };
}
