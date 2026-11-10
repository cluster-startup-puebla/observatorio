import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseAnon, usesSupabaseAuth } from "@/lib/supabase/auth-session";
import type { AccountRole } from "@/lib/directory";
import { eventIsOpen } from "./event-open";

export async function currentEventOpen() {
  if (!usesSupabaseAuth()) return true;
  const result = await createSupabaseAnon()
    .from("sessions")
    .select("session_on, starts_local, time_zone")
    .eq("is_current", true)
    .order("session_on", { ascending: true })
    .order("starts_local", { ascending: true })
    .limit(1);
  const row = result.data?.[0];
  if (result.error || !row) return false;
  return eventIsOpen({
    now: new Date(),
    sessionOn: row.session_on,
    startsLocal: row.starts_local,
    timeZone: row.time_zone,
  });
}

export async function redirectIfEventClosed() {
  if (usesSupabaseAuth() && !(await currentEventOpen())) redirect("/onboarding");
}

export async function eventOpenForRole(role: AccountRole) {
  if (role !== "empresario" || !usesSupabaseAuth()) return undefined;
  return currentEventOpen();
}
