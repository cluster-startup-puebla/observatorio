import "server-only";

import type { AccountRole } from "@/lib/directory";
import { getDirectory } from "@/lib/memory-directory";
import { readAccountId } from "@/lib/session";
import {
  createSupabaseAnon,
  createSupabaseWithAccess,
  readAccessToken,
  usesSupabaseAuth,
} from "@/lib/supabase/auth-session";
import { isAccountRole } from "./home";

export type SessionAccount = { id: string; role: AccountRole; email: string };

export async function readSessionAccount(): Promise<SessionAccount | null> {
  if (!usesSupabaseAuth()) {
    const id = await readAccountId();
    const account = id ? await getDirectory().getAccount(id) : null;
    if (!account) return null;
    return { id: account.id, role: account.role, email: account.email };
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
  const role = profile.data?.role;
  if (profile.error || typeof role !== "string" || !isAccountRole(role)) return null;
  return {
    id: user.data.user.id,
    role,
    email: profile.data?.email ?? user.data.user.email ?? "",
  };
}
