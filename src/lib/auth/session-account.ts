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
import { linkPassPending } from "@/lib/onboarding/link-pass-state";
import { isAccountRole } from "./home";

export type SessionAccount = {
  id: string;
  role: AccountRole;
  email: string;
  onboarded: boolean;
  awaitingApproval: boolean;
};

async function inviteStillPending(token: string, email: string, role: AccountRole, onboarded: boolean) {
  if (role !== "empresario" || !onboarded || !email) return false;
  try {
    return await linkPassPending(token, email);
  } catch (error) {
    console.error("invite approval", error instanceof Error ? error.message : "error");
    return false;
  }
}

export async function readSessionAccount(): Promise<SessionAccount | null> {
  if (!usesSupabaseAuth()) {
    const id = await readAccountId();
    const account = id ? await getDirectory().getAccount(id) : null;
    if (!account) return null;
    return {
      id: account.id,
      role: account.role,
      email: account.email,
      onboarded: account.onboarded,
      awaitingApproval: false,
    };
  }

  const token = await readAccessToken();
  if (!token) return null;
  const user = await createSupabaseAnon().auth.getUser(token);
  if (user.error || !user.data.user) return null;
  const profile = await createSupabaseWithAccess(token)
    .from("profiles")
    .select("role, email, onboarded_at")
    .eq("id", user.data.user.id)
    .maybeSingle();
  const role = profile.data?.role;
  if (profile.error || typeof role !== "string" || !isAccountRole(role)) return null;
  const email = profile.data?.email ?? user.data.user.email ?? "";
  const onboarded = Boolean(profile.data?.onboarded_at);
  return {
    id: user.data.user.id,
    role,
    email,
    onboarded,
    awaitingApproval: await inviteStillPending(token, email, role, onboarded),
  };
}
