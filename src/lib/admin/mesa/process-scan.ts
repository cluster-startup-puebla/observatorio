import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { guestQuery, mesaGuest } from "@/lib/admin/mesa/guest";
import { mesaHref } from "@/lib/admin/mesa/href";
import { maybeAwardArrival } from "@/lib/lavas/maybe-award-arrival";

export type MesaScanAccount = { id: string };

type PrepareRow = {
  ok?: boolean | null;
  reason?: string | null;
  profile_id?: string | null;
  rsvp_id?: string | null;
  full_name?: string | null;
  company_name?: string | null;
  sector_name?: string | null;
  invited_by?: string | null;
};

function firstRow(data: unknown): PrepareRow | null {
  if (!data) return null;
  if (Array.isArray(data)) return (data[0] as PrepareRow | undefined) ?? null;
  return data as PrepareRow;
}

function fail(code: string, reason: string) {
  return `${mesaHref}?codigo=${encodeURIComponent(code)}&error=${encodeURIComponent(reason)}`;
}

export async function processMesaScan(
  db: SupabaseClient,
  account: MesaScanAccount,
  rawCode: string,
): Promise<string> {
  const code = rawCode.trim();
  if (!code) return fail("", "sin lectura");

  const prepared = await db.rpc("mesa_prepare_arrival", { p_code: code });
  if (prepared.error) return fail(code, prepared.error.message);

  const row = firstRow(prepared.data);
  if (!row?.ok) return fail(code, row?.reason?.trim() || "sin qr");

  const guest = mesaGuest({
    full_name: row.full_name,
    company_name: row.company_name,
    sector_name: row.sector_name,
    invited_by: row.invited_by,
  });
  const profileId = row.profile_id ? String(row.profile_id) : null;
  const rsvpId = row.rsvp_id ? String(row.rsvp_id) : null;
  const guestKey = profileId || rsvpId || code;

  if (profileId) {
    const inserted = await db.from("arrivals").insert({
      profile_id: profileId,
      scanned_by: account.id,
    });
    if (inserted.error) return fail(code, inserted.error.message);

    const company = await db.from("companies").select("id").eq("profile_id", profileId).maybeSingle();
    if (company.data?.id) {
      await maybeAwardArrival(db, { companyId: company.data.id, profileId }).catch((error) =>
        console.error("lavas llegada", error),
      );
    }
  }

  return `${mesaHref}?${guestQuery(guestKey, guest)}`;
}
