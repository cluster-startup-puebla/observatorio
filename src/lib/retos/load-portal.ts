import "server-only";

import { createSupabaseAnon } from "@/lib/supabase/auth-session";
import { companyLabel } from "./company-label";

export type PortalChallenge = {
  id: string;
  name: string;
  area: string;
  descriptionHtml: string;
  successMetric: string;
  urgency: string | null;
  companyLabel: string;
  publishedAt: string;
};

const select =
  "id, name, area, description_html, success_metric, urgency, show_company, company_name_snapshot, published_at";

function mapRow(row: {
  id: string;
  name: string;
  area: string;
  description_html: string;
  success_metric: string;
  urgency: string | null;
  show_company: boolean;
  company_name_snapshot: string | null;
  published_at: string | null;
}): PortalChallenge {
  return {
    id: row.id,
    name: row.name,
    area: row.area,
    descriptionHtml: row.description_html,
    successMetric: row.success_metric,
    urgency: row.urgency,
    companyLabel: companyLabel({
      showCompany: row.show_company,
      snapshot: row.company_name_snapshot,
    }),
    publishedAt: row.published_at ?? "",
  };
}

export async function listPortalChallenges(): Promise<PortalChallenge[]> {
  const db = createSupabaseAnon();
  const result = await db
    .from("challenges")
    .select(select)
    .eq("status", "publicado")
    .eq("visibility", "portal")
    .order("published_at", { ascending: false });
  if (result.error) throw new Error(result.error.message);
  return (result.data ?? []).map(mapRow);
}

export async function getPortalChallenge(id: string): Promise<PortalChallenge | null> {
  const db = createSupabaseAnon();
  const result = await db
    .from("challenges")
    .select(select)
    .eq("id", id)
    .eq("status", "publicado")
    .eq("visibility", "portal")
    .maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (!result.data) return null;
  return mapRow(result.data);
}
