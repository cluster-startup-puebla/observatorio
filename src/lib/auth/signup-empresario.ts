import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { confirmEmailRedirect, unconfirmedSignup, verifyEmailPath } from "@/lib/auth/confirm-email";
import { sendOwnMail } from "@/lib/mail/send-own";
import { signupErrorCode } from "@/lib/organismo/signup-back";
import { createSupabaseAnon, writeSupabaseSession } from "@/lib/supabase/auth-session";

function nextPath(sector: string, invite: string, base = "/onboarding") {
  const query = new URLSearchParams();
  if (sector) query.set("sector", sector);
  if (invite) query.set("invitacion", invite);
  const search = query.toString();
  return search ? `${base}?${search}` : base;
}

async function skipConfirm(anon: SupabaseClient, email: string, password: string, sector: string, invite: string) {
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
  await sendOwnMail(logged.data.session.access_token, "welcome");
  return { next: nextPath(sector, invite) };
}

export async function signupEmpresarioAndSession(email: string, password: string, sector: string, invite: string) {
  const normalized = email.trim().toLowerCase();
  const anon = createSupabaseAnon();
  const needConfirm = process.env.AUTH_NEED_CONFIRM === "1";
  const signed = await anon.auth.signUp({
    email: normalized,
    password,
    options: {
      data: { intent: "empresario" },
      emailRedirectTo: confirmEmailRedirect(process.env.NEXT_PUBLIC_SITE_URL),
    },
  });
  if (signed.error) {
    const code = signupErrorCode(signed.error.message);
    if (code === "limite" && !needConfirm) return skipConfirm(anon, normalized, password, sector, invite);
    if (code === "confirmar") return { next: verifyEmailPath({ email: normalized, sector, invite }) };
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
  if (gate === "verificar") return { next: verifyEmailPath({ email: normalized, sector, invite }) };
  if (!session) return { error: "auth" };
  await writeSupabaseSession(session);
  await sendOwnMail(session.access_token, "welcome");
  return { next: nextPath(sector, invite) };
}
