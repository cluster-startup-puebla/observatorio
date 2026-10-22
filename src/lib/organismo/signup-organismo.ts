import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseAnon, writeSupabaseSession } from "@/lib/supabase/auth-session";

function signupError(message: string) {
  const known = message.toLowerCase();
  if (known.includes("already") || known.includes("registered")) return "existe";
  if (known.includes("password")) return "contrasena";
  return "auth";
}

export async function signupOrganismoAndSession(email: string, password: string, sector: string) {
  const normalized = email.trim().toLowerCase();
  const anon = createSupabaseAnon();
  const signed = await anon.auth.signUp({ email: normalized, password });
  if (signed.error) redirect(`/register?error=${signupError(signed.error.message)}`);

  let session = signed.data.session;
  if (!session) {
    const logged = await anon.auth.signInWithPassword({ email: normalized, password });
    if (logged.error || !logged.data.session) redirect("/register?error=confirmar");
    session = logged.data.session;
  }

  await writeSupabaseSession(session);
  redirect(sector ? `/onboarding?sector=${encodeURIComponent(sector)}` : "/onboarding");
}
