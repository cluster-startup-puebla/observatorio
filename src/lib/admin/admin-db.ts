import "server-only";

import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import {
  createSupabaseWithAccess,
  readAccessToken,
  usesSupabaseAuth,
} from "@/lib/supabase/auth-session";

export async function adminDb() {
  await requireSuperadmin();
  if (!usesSupabaseAuth()) return null;
  const token = await readAccessToken();
  if (!token) return null;
  return createSupabaseWithAccess(token);
}
