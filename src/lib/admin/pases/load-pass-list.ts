import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { mapLegacyPassRow } from "@/lib/admin/pases/map-legacy-pass-row";
import { mapRsvpPassRow } from "@/lib/admin/pases/map-rsvp-pass-row";
import { one, type CompanyFace, type RsvpEmbed } from "@/lib/admin/pases/pass-list-embed";
import type { PassListRow } from "@/lib/admin/pases/pass-list-row";

/** Load RSVP + legacy passes into one list (newest first). */
export async function loadPassListRows(db: SupabaseClient): Promise<PassListRow[]> {
  const [rsvp, legacy] = await Promise.all([
    db
      .from("rsvp_passes")
      .select(
        "rsvp_id, issued_at, sessions(title), session_rsvps!inner(email, full_name, company_name, profile_id, sector_id, status, profiles(full_name, email), companies(legal_name, sector_id, sectors(name)), sectors(name))",
      )
      .eq("session_rsvps.status", "confirmed"),
    db.from("passes").select("profile_id, issued_at, profiles(full_name, email)"),
  ]);
  if (rsvp.error) throw new Error(rsvp.error.message);
  if (legacy.error) throw new Error(legacy.error.message);

  const profileIds = [
    ...new Set(
      [
        ...(rsvp.data ?? []).map((row) => one(row.session_rsvps as RsvpEmbed | RsvpEmbed[] | null)?.profile_id),
        ...(legacy.data ?? []).map((row) => row.profile_id),
      ].filter((id): id is string => Boolean(id)),
    ),
  ];

  const [arrivals, companies] = await Promise.all([
    profileIds.length
      ? db.from("arrivals").select("profile_id, scanned_at").in("profile_id", profileIds)
      : Promise.resolve({ data: [] as { profile_id: string; scanned_at: string }[], error: null }),
    profileIds.length
      ? db
          .from("companies")
          .select("profile_id, legal_name, sector_id, sectors(name)")
          .in("profile_id", profileIds)
      : Promise.resolve({
          data: [] as {
            profile_id: string;
            legal_name: string | null;
            sector_id: string | null;
            sectors: { name: string | null } | { name: string | null }[] | null;
          }[],
          error: null,
        }),
  ]);
  if (arrivals.error) throw new Error(arrivals.error.message);
  if (companies.error) throw new Error(companies.error.message);

  const arrived = new Map((arrivals.data ?? []).map((row) => [row.profile_id, row.scanned_at]));
  const companyByProfile = new Map<string, CompanyFace>(
    (companies.data ?? []).map((row) => [
      row.profile_id,
      { name: row.legal_name ?? "", sectorId: row.sector_id ?? "", sector: one(row.sectors)?.name ?? "" },
    ]),
  );

  const rows: PassListRow[] = [];
  const seenProfile = new Set<string>();
  for (const row of rsvp.data ?? []) {
    const mapped = mapRsvpPassRow(row, arrived, companyByProfile);
    if (!mapped) continue;
    if (mapped.profile_id) seenProfile.add(mapped.profile_id);
    rows.push(mapped);
  }
  for (const row of legacy.data ?? []) {
    if (seenProfile.has(row.profile_id)) continue;
    rows.push(mapLegacyPassRow(row, arrived, companyByProfile));
  }
  return rows.sort((a, b) => Date.parse(b.issued_at) - Date.parse(a.issued_at));
}
