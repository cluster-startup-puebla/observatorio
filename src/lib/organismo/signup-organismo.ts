import "server-only";

import type { Session } from "@supabase/supabase-js";
import { createSupabaseAnon, writeSupabaseSession } from "@/lib/supabase/auth-session";
import { signupErrorCode } from "./signup-back";
import { writeOrgIntent } from "./signup-intent";
import { signupSkippingConfirm } from "./signup-skip-confirm";

function onboardingPath(sector: string) {
  return sector ? `/onboarding?sector=${encodeURIComponent(sector)}` : "/onboarding";
}

function verificarPath(sector: string) {
  const query = new URLSearchParams({ cuenta: "organismo" });
  if (sector) query.set("sector", sector);
  return `/verificar?${query.toString()}`;
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
    options: { data: { intent: "organismo" } },
  });

  if (signed.error) {
    const code = signupErrorCode(signed.error.message);
    if (code === "limite" && !needConfirm) return signupSkippingConfirm(anon, normalized, password, sector);
    return { error: code };
  }

  let session = signed.data.session;
  if (!session && !needConfirm) {
    const logged = await anon.auth.signInWithPassword({ email: normalized, password });
    session = logged.data.session;
  }
  if (!session) return needConfirm ? { next: verificarPath(sector) } : { error: "auth" };
  return sessionOrCode(session, sector);
}
