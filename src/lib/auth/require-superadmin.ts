import { cache } from "react";
import { redirect } from "next/navigation";
import { getDirectory } from "@/lib/memory-directory";
import { readAccountId } from "@/lib/session";
import {
  createSupabaseAnon,
  createSupabaseWithAccess,
  readAccessToken,
  usesSupabaseAuth,
} from "@/lib/supabase/auth-session";

export const readSuperadmin = cache(async function readSuperadmin() {
  if (!usesSupabaseAuth()) {
    const id = await readAccountId();
    const found = id ? await getDirectory().getAccount(id) : null;
    if (!found || found.role !== "superadmin") return null;
    return { email: found.email };
  }

  const token = await readAccessToken();
  if (!token) return null;
  const user = await createSupabaseAnon().auth.getUser(token);
  if (user.error || !user.data.user) return null;
  const profile = await createSupabaseWithAccess(token)
    .from("profiles")
    .select("role, email")
    .eq("id", user.data.user.id)
    .maybeSingle();
  if (profile.error || profile.data?.role !== "superadmin") return null;
  return { email: profile.data.email ?? user.data.user.email ?? "" };
});

export async function requireSuperadmin() {
  const account = await readSuperadmin();
  if (!account) redirect("/admin/login");
  return account;
}
