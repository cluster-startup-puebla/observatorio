import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { writeSupabaseSession } from "@/lib/supabase/auth-session";
import { signupErrorCode } from "./signup-back";
import { writeOrgIntent } from "./signup-intent";

export async function signupSkippingConfirm(
  anon: SupabaseClient,
  email: string,
  password: string,
  sector: string,
) {
  const created = await anon.rpc("signup_public_account", {
    account_email: email,
    account_password: password,
  });
  if (created.error) return { error: signupErrorCode(created.error.message) };

  const logged = await anon.auth.signInWithPassword({ email, password });
  if (logged.error || !logged.data.session) {
    return { error: logged.error ? signupErrorCode(logged.error.message) : "confirmar" };
  }
  await writeSupabaseSession(logged.data.session);
  await writeOrgIntent();
  return { next: sector ? `/onboarding?sector=${encodeURIComponent(sector)}` : "/onboarding" };
}
