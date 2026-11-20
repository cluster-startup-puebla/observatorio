import "server-only";

import { empresarioCompanyDb } from "./own-company";

export type MyChallenge = {
  id: string;
  name: string;
  area: string;
  areaNote: string | null;
  descriptionHtml: string;
  successMetric: string;
  urgency: string | null;
  status: string;
  visibility: string;
  showCompany: boolean;
  updatedAt: string;
};

export async function loadMyChallenges(): Promise<MyChallenge[]> {
  const ctx = await empresarioCompanyDb();
  if (!ctx) return [];
  const rows = await ctx.db
    .from("challenges")
    .select(
      "id, name, area, area_note, description_html, success_metric, urgency, status, visibility, show_company, updated_at",
    )
    .eq("company_id", ctx.company.id)
    .in("status", ["borrador", "publicado"])
    .order("updated_at", { ascending: false });
  if (rows.error) throw new Error(rows.error.message);
  return (rows.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    area: row.area,
    areaNote: row.area_note,
    descriptionHtml: row.description_html,
    successMetric: row.success_metric,
    urgency: row.urgency,
    status: row.status,
    visibility: row.visibility,
    showCompany: row.show_company,
    updatedAt: row.updated_at,
  }));
}
