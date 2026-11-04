import "server-only";

import { createSupabaseAnon, usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { confirmEmailRedirect, resendConfirmationResult } from "./confirm-email";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function resendSignupConfirmation(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!emailPattern.test(normalized)) return "correo" as const;
  if (!usesSupabaseAuth()) return "ok" as const;
  const emailRedirectTo = confirmEmailRedirect(process.env.NEXT_PUBLIC_SITE_URL);
  const sent = await createSupabaseAnon().auth.resend({
    type: "signup",
    email: normalized,
    options: emailRedirectTo ? { emailRedirectTo } : undefined,
  });
  if (sent.error) console.error("resend confirmation", sent.error.message);
  return resendConfirmationResult(sent.error?.message ?? null);
}
