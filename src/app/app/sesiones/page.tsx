import { connection } from "next/server";
import { SessionGroups } from "@/components/app/session-groups";
import { splitSessions } from "@/lib/app/sector-sessions";
import { loadSectorSessions } from "@/lib/app/load-sector-sessions";
import { readSessionAccount } from "@/lib/auth/session-account";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";

export const instant = false;

function mexicoToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

async function companySectorId(token: string, profileId: string) {
  const company = await createSupabaseWithAccess(token)
    .from("companies")
    .select("sector_id")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (company.error) throw new Error(company.error.message);
  const sectorId = company.data?.sector_id;
  return typeof sectorId === "string" ? sectorId : "";
}

export default async function SessionsPage() {
  await connection();
  const account = await readSessionAccount();
  const token = await readAccessToken();
  const sectorId = account && token ? await companySectorId(token, account.id) : "";
  const rows = token && sectorId ? await loadSectorSessions(token, sectorId) : [];
  const groups = splitSessions(rows, mexicoToday());

  return (
    <div className="grid gap-8">
      <h1 className="text-h2 text-ink">Sesiones</h1>
      <SessionGroups upcoming={groups.upcoming} past={groups.past} />
    </div>
  );
}
