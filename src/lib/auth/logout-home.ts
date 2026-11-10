"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clearAccountId } from "@/lib/session";
import { clearSupabaseSession, usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { logoutDestination } from "./logout-door";

export async function logoutHomeAction() {
  if (usesSupabaseAuth()) await clearSupabaseSession();
  await clearAccountId();
  const jar = await cookies();
  jar.delete("org-slug");
  redirect(logoutDestination("home"));
}
