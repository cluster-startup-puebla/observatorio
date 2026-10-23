import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { visibleEventLogos } from "./event-logos";

export async function loadEventLogos() {
  const db = await adminDb();
  if (!db) return [];
  const companies = await db.from("companies").select("id, legal_name, profile_id, show_logo_on_event");
  if (companies.error) throw new Error(companies.error.message);
  const ids = (companies.data ?? []).map((row) => row.profile_id as string);
  const assets = ids.length
    ? await db.from("media_assets").select("profile_id").eq("purpose", "company_logo").in("profile_id", ids)
    : { data: [], error: null };
  if (assets.error) throw new Error(assets.error.message);
  return visibleEventLogos(
    (companies.data ?? []).map((row) => ({
      id: row.id as string,
      legalName: row.legal_name as string,
      profileId: row.profile_id as string,
      show: Boolean(row.show_logo_on_event),
    })),
    (assets.data ?? []).map((row) => ({ profileId: row.profile_id as string })),
  );
}
