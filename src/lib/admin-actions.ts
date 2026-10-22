"use server";

import { redirect } from "next/navigation";
import { bootstrapAdminErrors } from "./bootstrap-admin";
import { getDirectory } from "./memory-directory";
import { clearAccountId, writeAccountId } from "./session";
import {
  clearSupabaseSession,
  createSupabaseAnon,
  createSupabaseWithAccess,
  superadminExists,
  usesSupabaseAuth,
  writeSupabaseSession,
} from "./supabase/auth-session";

function signupError(message: string) {
  const known = message.toLowerCase();
  if (known.includes("already") || known.includes("registered")) return "existe";
  if (known.includes("password")) return "contrasena";
  return "auth";
}

export async function createFirstSuperadminAction(formData: FormData) {
  const email = String(formData.get("correo") ?? "");
  const password = String(formData.get("contrasena") ?? "");
  const errors = bootstrapAdminErrors({ email, password });
  if (errors?.email) redirect("/admin/signup?error=correo");
  if (errors?.password) redirect("/admin/signup?error=contrasena");

  if (!usesSupabaseAuth()) {
    const result = await getDirectory().createFirstSuperadmin({ email, password });
    if (!result.ok) redirect("/admin/signup?error=existe");
    await writeAccountId(result.id);
    redirect("/admin");
  }

  const normalized = email.trim().toLowerCase();
  if (await superadminExists()) redirect("/admin/login");

  const anon = createSupabaseAnon();
  const signed = await anon.auth.signUp({ email: normalized, password });
  if (signed.error) redirect(`/admin/signup?error=${signupError(signed.error.message)}`);

  let session = signed.data.session;
  if (!session) {
    const logged = await anon.auth.signInWithPassword({ email: normalized, password });
    if (logged.error || !logged.data.session) redirect("/admin/signup?error=confirmar");
    session = logged.data.session;
  }

  const claim = await createSupabaseWithAccess(session.access_token).rpc("claim_first_superadmin");
  if (claim.error) redirect("/admin/signup?error=existe");

  await writeSupabaseSession(session);
  redirect("/admin");
}

export async function loginSuperadminAction(formData: FormData) {
  const email = String(formData.get("correo") ?? "");
  const password = String(formData.get("contrasena") ?? "");
  const errors = bootstrapAdminErrors({ email, password });
  if (errors?.email) redirect("/admin/login?error=correo");
  if (errors?.password) redirect("/admin/login?error=contrasena");

  if (!usesSupabaseAuth()) {
    const result = await getDirectory().loginSuperadmin({ email, password });
    if (!result.ok) redirect("/admin/login?error=credenciales");
    await writeAccountId(result.id);
    redirect("/admin");
  }

  const normalized = email.trim().toLowerCase();
  const anon = createSupabaseAnon();
  const logged = await anon.auth.signInWithPassword({ email: normalized, password });
  if (logged.error || !logged.data.session || !logged.data.user) {
    redirect("/admin/login?error=credenciales");
  }

  const profile = await createSupabaseWithAccess(logged.data.session.access_token)
    .from("profiles")
    .select("role")
    .eq("id", logged.data.user.id)
    .maybeSingle();
  if (profile.error || profile.data?.role !== "superadmin") {
    redirect("/admin/login?error=rol");
  }

  await writeSupabaseSession(logged.data.session);
  redirect("/admin");
}

export async function logoutAdminAction() {
  if (usesSupabaseAuth()) await clearSupabaseSession();
  await clearAccountId();
  redirect("/admin/login");
}
