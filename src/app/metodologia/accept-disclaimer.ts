"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { disclaimerCookie } from "@/lib/methodology/v2/disclaimer-gate";
import { createSupabaseWithAccess, readAccessToken, usesSupabaseAuth } from "@/lib/supabase/auth-session";

async function rememberLocally() {
  const jar = await cookies();
  jar.set(disclaimerCookie, new Date().toISOString(), { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function acceptDisclaimer() {
  if (!usesSupabaseAuth()) {
    await rememberLocally();
    redirect("/metodologia?listo=1");
  }

  const token = await readAccessToken();
  if (!token) redirect("/login");
  const db = createSupabaseWithAccess(token);
  const user = await db.auth.getUser();
  const id = user.data.user?.id;
  if (user.error || !id) redirect("/login");

  const saved = await db
    .from("profiles")
    .update({ methodology_confidentiality_accepted_at: new Date().toISOString() })
    .eq("id", id)
    .is("methodology_confidentiality_accepted_at", null);
  if (saved.error) throw new Error(saved.error.message);
  redirect("/metodologia?listo=1");
}
