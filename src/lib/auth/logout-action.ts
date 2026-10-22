"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clearAccountId } from "@/lib/session";
import { clearSupabaseSession, usesSupabaseAuth } from "@/lib/supabase/auth-session";

export async function logoutAction() {
  if (usesSupabaseAuth()) await clearSupabaseSession();
  await clearAccountId();
  const jar = await cookies();
  jar.delete("org-slug");
  redirect("/login?aviso=sesion");
}
