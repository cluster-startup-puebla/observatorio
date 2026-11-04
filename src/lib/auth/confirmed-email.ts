import "server-only";

import { createSupabaseAnon, usesSupabaseAuth } from "@/lib/supabase/auth-session";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function emailIsConfirmed(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!emailPattern.test(normalized) || !usesSupabaseAuth()) return false;
  const checked = await createSupabaseAnon().rpc("email_is_confirmed", { target: normalized });
  if (checked.error || checked.data !== true) return false;
  return true;
}
