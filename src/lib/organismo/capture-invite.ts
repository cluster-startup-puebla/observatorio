import "server-only";

import { readSessionAccount } from "@/lib/auth/session-account";
import { getDirectory } from "@/lib/memory-directory";
import { readAccountId } from "@/lib/session";
import { createSupabaseWithAccess, readAccessToken, usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { attributeSignup } from "./attribute-signup";

async function captureMemoryInvite(token: string, sectorSlug: string) {
  const id = await readAccountId();
  if (!id) return;
  const account = await getDirectory().getAccount(id);
  if (!account?.onboarded || account.role !== "empresario") return;
  await getDirectory().attributeRegistration({ token, email: account.email, sectorSlug });
}

export async function captureFinishedInvite(token: string, sectorSlug: string) {
  if (!usesSupabaseAuth()) {
    await captureMemoryInvite(token, sectorSlug);
    return;
  }
  const session = await readSessionAccount();
  const access = await readAccessToken();
  if (!session || session.role !== "empresario" || !access) return;
  const db = createSupabaseWithAccess(access);
  const profile = await db.from("profiles").select("full_name, onboarded_at").eq("id", session.id).maybeSingle();
  const company = await db.from("companies").select("legal_name").eq("profile_id", session.id).maybeSingle();
  if (profile.error || company.error) throw new Error(profile.error?.message ?? company.error?.message);
  const finished = Boolean(profile.data?.onboarded_at) || Boolean(company.data?.legal_name);
  if (!finished) return;
  await attributeSignup({
    token,
    email: session.email,
    sectorSlug,
    nombre: profile.data?.full_name ?? "",
    empresa: company.data?.legal_name ?? "",
  });
}
