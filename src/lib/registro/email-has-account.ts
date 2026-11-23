import "server-only";

import { createSupabaseAnon, usesSupabaseAuth } from "@/lib/supabase/auth-session";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registroEmailHasAccount(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!emailPattern.test(normalized) || !usesSupabaseAuth()) return false;
  const checked = await createSupabaseAnon().rpc("email_has_account", { target: normalized });
  return !checked.error && checked.data === true;
}