"use server";

import { redirect } from "next/navigation";
import { accountErrors } from "@/lib/account-draft";
import { getDirectory } from "@/lib/memory-directory";
import { writeAccountId } from "@/lib/session";
import { usesSupabaseAuth, writeSupabaseSession } from "@/lib/supabase/auth-session";
import { homeForRole } from "./home";
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
    redirect(homeForRole(result.role));
  }

  const signed = await signInWithPassword(email, password);
  if (!signed.ok) redirect(`/login?error=${signed.reason}`);
  await writeSupabaseSession(signed.session);
  redirect(homeForRole(signed.role));
}
