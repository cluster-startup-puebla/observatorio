import "server-only";

import type { Session } from "@supabase/supabase-js";
import { confirmEmailRedirect, unconfirmedSignup, verifyEmailPath } from "@/lib/auth/confirm-email";
import { createSupabaseAnon, writeSupabaseSession } from "@/lib/supabase/auth-session";
import { signupErrorCode } from "./signup-back";
import { writeOrgIntent } from "./signup-intent";
import { signupSkippingConfirm } from "./signup-skip-confirm";

function onboardingPath(sector: string) {
  return sector ? `/onboarding?sector=${encodeURIComponent(sector)}` : "/onboarding";
}

async function sessionOrCode(session: Session, sector: string) {
  await writeSupabaseSession(session);
  await writeOrgIntent();
  return { next: onboardingPath(sector) };
}

export async function signupOrganismoAndSession(email: string, password: string, sector: string) {
  const normalized = email.trim().toLowerCase();
  const anon = createSupabaseAnon();
  const needConfirm = process.env.AUTH_NEED_CONFIRM === "1";
  const signed = await anon.auth.signUp({
    email: normalized,
    password,
    options: {
      data: { intent: "organismo" },
      emailRedirectTo: confirmEmailRedirect(process.env.NEXT_PUBLIC_SITE_URL),
    },
  });

  if (signed.error) {
    const code = signupErrorCode(signed.error.message);
    if (code === "limite" && !needConfirm) return signupSkippingConfirm(anon, normalized, password, sector);
    if (code === "confirmar") return { next: verifyEmailPath({ email: normalized, sector, cuenta: "organismo" }) };
    return { error: code };
  }

  let session = signed.data.session;
  let signInError: string | null = null;
  if (!session && !needConfirm) {
    const logged = await anon.auth.signInWithPassword({ email: normalized, password });
    signInError = logged.error?.message ?? null;
    session = logged.data.session;
  }
  const gate = unconfirmedSignup({ needConfirm, signInError, gotSession: Boolean(session) });
  if (gate === "verificar") return { next: verifyEmailPath({ email: normalized, sector, cuenta: "organismo" }) };
  if (!session) return { error: "auth" };
  return sessionOrCode(session, sector);
}
