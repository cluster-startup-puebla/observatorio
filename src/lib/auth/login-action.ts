"use server";

import { redirect } from "next/navigation";
import { accountErrors } from "@/lib/account-draft";
import { getDirectory } from "@/lib/memory-directory";
import { writeAccountId } from "@/lib/session";
import { usesSupabaseAuth, writeSupabaseSession } from "@/lib/supabase/auth-session";
import { homeForRole } from "./home";
import { orgSlugForUser, setOrgSlugCookie } from "./login-org";
import { signInWithPassword } from "./sign-in";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("correo") ?? "");
  const password = String(formData.get("contrasena") ?? "");
  const errors = accountErrors({ email, password });
  if (errors?.email) redirect("/login?error=correo");
  if (errors?.password) redirect("/login?error=contrasena");

  if (!usesSupabaseAuth()) {
    const result = await getDirectory().loginAccount({ email, password });
    if (!result.ok) redirect("/login?error=credenciales");
    await writeAccountId(result.id);
    const account = await getDirectory().getAccount(result.id);
    if (account?.orgSlug) await setOrgSlugCookie(account.orgSlug);
    redirect(homeForRole(result.role, account?.orgSlug));
  }

  const signed = await signInWithPassword(email, password);
  if (!signed.ok) redirect(`/login?error=${signed.reason}`);
  await writeSupabaseSession(signed.session);
  const slug = await orgSlugForUser(signed.session.access_token, signed.session.user.id);
  if (slug) await setOrgSlugCookie(slug);
  redirect(homeForRole(signed.role, slug));
}
