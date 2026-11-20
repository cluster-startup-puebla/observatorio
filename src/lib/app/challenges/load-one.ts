"use server";

import { empresarioCompanyDb } from "./own-company";
import type { MyChallenge } from "./load-mine";

export async function loadOneChallenge(id: string): Promise<MyChallenge | null> {
  const ctx = await empresarioCompanyDb();
  if (!ctx) return null;
  const result = await ctx.db
    .from("challenges")
    .select(
      "id, name, area, description_html, success_metric, urgency, status, visibility, show_company, updated_at",
    )
    .eq("id", id)
    .eq("company_id", ctx.company.id)
    .maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (!result.data) return null;
  const row = result.data;
  return {
    id: row.id,
    name: row.name,
    area: row.area,
    descriptionHtml: row.description_html,
    successMetric: row.success_metric,
    urgency: row.urgency,
    status: row.status,
    visibility: row.visibility,
    showCompany: row.show_company,
    updatedAt: row.updated_at,
  };
}
