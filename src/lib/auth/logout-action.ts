"use server";

import { redirect } from "next/navigation";
import { clearAccountId } from "@/lib/session";
import { clearSupabaseSession, usesSupabaseAuth } from "@/lib/supabase/auth-session";

export async function logoutAction() {
  if (usesSupabaseAuth()) await clearSupabaseSession();
  await clearAccountId();
  redirect("/login?aviso=sesion");
}
