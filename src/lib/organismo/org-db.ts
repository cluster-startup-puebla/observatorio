import "server-only";

import { createSupabaseWithAccess, readAccessToken, usesSupabaseAuth } from "@/lib/supabase/auth-session";

export async function orgDb() {
  if (!usesSupabaseAuth()) return null;
  const token = await readAccessToken();
  if (!token) return null;
  return createSupabaseWithAccess(token);
}
