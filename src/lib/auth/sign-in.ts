import "server-only";

import type { Session } from "@supabase/supabase-js";
import type { AccountRole } from "@/lib/directory";
import {
  clearSupabaseSession,
  createSupabaseAnon,
  createSupabaseWithAccess,
} from "@/lib/supabase/auth-session";
import { isAccountRole } from "./home";

export type SignInResult =
  | { ok: true; session: Session; role: AccountRole }
  | { ok: false; reason: "credenciales" | "rol" | "confirmar" };

async function openConfirmedLogin(email: string, password: string) {
  if (process.env.AUTH_NEED_CONFIRM === "1") return false;
  const opened = await createSupabaseAnon().rpc("confirm_login_email", {
    account_email: email,
    account_password: password,
  });
  return opened.data === true;
}

export async function signInWithPassword(email: string, password: string): Promise<SignInResult> {
  const normalized = email.trim().toLowerCase();
  let logged = await createSupabaseAnon().auth.signInWithPassword({ email: normalized, password });
  const pending = (logged.error?.message ?? "").toLowerCase().includes("not confirmed");
  if (pending && (await openConfirmedLogin(normalized, password))) {
    logged = await createSupabaseAnon().auth.signInWithPassword({ email: normalized, password });
  }
  if (logged.error || !logged.data.session || !logged.data.user) {
    const message = logged.error?.message.toLowerCase() ?? "";
    if (message.includes("not confirmed")) return { ok: false, reason: "confirmar" };
    return { ok: false, reason: "credenciales" };
  }

  const profile = await createSupabaseWithAccess(logged.data.session.access_token)
    .from("profiles")
    .select("role")
    .eq("id", logged.data.user.id)
    .maybeSingle();
  const role = profile.data?.role;
  if (profile.error || typeof role !== "string" || !isAccountRole(role)) {
    await clearSupabaseSession();
    return { ok: false, reason: "rol" };
  }

  return { ok: true, session: logged.data.session, role };
}
