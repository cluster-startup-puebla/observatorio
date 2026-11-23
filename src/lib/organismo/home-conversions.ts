import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { conversionMoments, linkConversions } from "./link-conversions";

type SectorJoin = { slug: string } | { slug: string }[] | null;

function sectorSlug(joined: SectorJoin) {
  if (!joined) return "";
  return Array.isArray(joined) ? (joined[0]?.slug ?? "") : joined.slug;
}

export async function enlacePeople(
  db: SupabaseClient,
  orgId: string,
  sessionId?: string | null,
) {
  let query = db
    .from("crm_contacts")
    .select("id, created_at, profile_id, sectors(slug)")
    .eq("organization_id", orgId)
    .eq("source", "enlace");
  if (sessionId) {
    const companies = await db.from("companies").select("profile_id").eq("session_id", sessionId);
    if (companies.error) throw new Error(companies.error.message);
    const profiles = (companies.data ?? []).map((row) => row.profile_id).filter(Boolean);
    if (profiles.length === 0) return [];
    query = query.in("profile_id", profiles);
  }
  const contacts = await query;
  if (contacts.error) throw new Error(contacts.error.message);
  const ids = (contacts.data ?? []).map((row) => row.id as string);
  const statuses = ids.length
    ? await db.from("crm_contact_status").select("contact_id, status").in("contact_id", ids)
    : { data: [], error: null };
  if (statuses.error) throw new Error(statuses.error.message);
  const statusOf = new Map((statuses.data ?? []).map((row) => [row.contact_id as string, row.status as string]));
  return (contacts.data ?? []).map((row) => ({
    slug: sectorSlug(row.sectors as SectorJoin),
    status: statusOf.get(row.id as string) ?? null,
    at: row.created_at as string,
  }));
}

export function peopleStats(people: { slug: string; status: string | null; at: string }[]) {
  const registrations = linkConversions(people);
  const conversions = [...registrations.values()].reduce((sum, count) => sum + count, 0);
  return { registrations, conversions, moments: conversionMoments(people) };
}
