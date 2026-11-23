import "server-only";

import { createSupabaseAnon } from "@/lib/supabase/auth-session";

export async function sessionIdBySlug(slug: string) {
  const db = createSupabaseAnon();
  const result = await db.from("sessions").select("id").eq("public_slug", slug).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  return result.data?.id ?? null;
}
