import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAnon, writeSupabaseSession } from "@/lib/supabase/auth-session";
import { signupErrorCode } from "@/lib/organismo/signup-back";

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
  return { next: nextPath(sector, invite) };
}

export async function signupEmpresarioAndSession(email: string, password: string, sector: string, invite: string) {
  const normalized = email.trim().toLowerCase();
  const anon = createSupabaseAnon();
  const needConfirm = process.env.AUTH_NEED_CONFIRM === "1";
  const signed = await anon.auth.signUp({
    email: normalized,
    password,
    options: { data: { intent: "empresario" } },
  });
  if (signed.error) {
    const code = signupErrorCode(signed.error.message);
    if (code === "limite" && !needConfirm) return skipConfirm(anon, normalized, password, sector, invite);
    return { error: code };
  }
  let session = signed.data.session;
  if (!session && !needConfirm) {
    const logged = await anon.auth.signInWithPassword({ email: normalized, password });
    session = logged.data.session;
  }
  if (!session) return needConfirm ? { next: nextPath(sector, invite, "/verificar") } : { error: "auth" };
  await writeSupabaseSession(session);
  return { next: nextPath(sector, invite) };
}
