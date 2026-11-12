import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { conversionMoments, linkConversions } from "@/lib/organismo/link-conversions";
import { linkStats } from "@/lib/organismo/link-stats";
import { opensForOrganization } from "@/lib/supabase/link-opens";

type SectorJoin = { slug: string } | { slug: string }[] | null;

function sectorSlug(joined: SectorJoin) {
  if (!joined) return "";
  return Array.isArray(joined) ? (joined[0]?.slug ?? "") : joined.slug;
}

export async function loadOrganismoActivity(id: string) {
  const now = new Date();
  const db = await adminDb();
  if (!db) return linkStats({ opens: [], conversions: 0, now });
  const opens = await opensForOrganization(db, id);
  const contacts = await db
    .from("crm_contacts")
    .select("id, created_at, sectors(slug)")
    .eq("organization_id", id)
    .eq("source", "enlace");
  if (contacts.error) throw new Error(contacts.error.message);
  const ids = (contacts.data ?? []).map((row) => row.id as string);
  const statuses = ids.length
    ? await db.from("crm_contact_status").select("contact_id, status").in("contact_id", ids)
    : { data: [], error: null };
  if (statuses.error) throw new Error(statuses.error.message);
  const statusOf = new Map((statuses.data ?? []).map((row) => [row.contact_id as string, row.status as string]));
  const people = (contacts.data ?? []).map((row) => ({
    slug: sectorSlug(row.sectors as SectorJoin),
    status: statusOf.get(row.id as string) ?? null,
    at: row.created_at as string,
  }));
  const registrations = linkConversions(people);
  const conversions = [...registrations.values()].reduce((sum, count) => sum + count, 0);
  return linkStats({ opens, conversions, convertedAt: conversionMoments(people), now });
}
