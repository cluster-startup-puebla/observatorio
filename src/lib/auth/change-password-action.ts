"use server";

import { redirect } from "next/navigation";
import { createSupabaseAnon, usesSupabaseAuth, writeSupabaseSession } from "@/lib/supabase/auth-session";
import { passwordChangeError } from "./password-change";
import { readSessionAccount } from "./session-account";
import { signInWithPassword } from "./sign-in";

function backPath(slug: string) {
  return /^[a-z0-9-]+$/.test(slug) ? `/${slug}/seguridad` : "/organismo";
}

export async function changePasswordAction(formData: FormData) {
  const back = backPath(String(formData.get("sector") ?? "").trim());
  const current = String(formData.get("actual") ?? "");
  const next = String(formData.get("nueva") ?? "");
  const confirm = String(formData.get("confirmar") ?? "");
  const invalid = passwordChangeError({ current, next, confirm });
  if (invalid) redirect(`${back}?error=${invalid}`);
  if (!usesSupabaseAuth()) redirect(`${back}?error=base`);

  const account = await readSessionAccount();
  if (!account) redirect("/login");
  const signed = await signInWithPassword(account.email, current);
  if (!signed.ok) redirect(`${back}?error=actual`);

  const client = createSupabaseAnon();
  const ready = await client.auth.setSession({
    access_token: signed.session.access_token,
    refresh_token: signed.session.refresh_token,
  });
  const updated = ready.error ? { error: ready.error } : await client.auth.updateUser({ password: next });
  if (updated.error || !ready.data.session) redirect(`${back}?error=guardar`);
  await writeSupabaseSession(ready.data.session);
  redirect(`${back}?listo=1`);
}
