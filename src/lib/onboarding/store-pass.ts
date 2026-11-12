import "server-only";

import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { writePass } from "./write-pass";

export async function storePass(accessToken: string, profileId: string) {
  return writePass(createSupabaseWithAccess(accessToken), profileId);
}

export async function savePassFile(profileId: string) {
  const db = createSupabaseAdmin();
  if (!db) return { ok: false as const };
  return writePass(db, profileId);
}
