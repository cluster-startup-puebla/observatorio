import "server-only";

import { readSessionAccount } from "@/lib/auth/session-account";
import { getDirectory } from "@/lib/memory-directory";
import { memoryStore } from "@/lib/memory/store";
import {
  createSupabaseWithAccess,
  readAccessToken,
  usesSupabaseAuth,
} from "@/lib/supabase/auth-session";

export type OrgOwner = { id: string; slug: string; name: string; email: string };

export async function ownerBySlug(slug: string): Promise<OrgOwner | null> {
  if (usesSupabaseAuth()) return ownerFromSupabase(slug);
  const person = memoryStore().people.find((item) => item.orgSlug === slug && !item.orgId);
  if (!person?.orgSlug || !person.name) return null;
  const account = await getDirectory().getAccount(person.id);
  if (!account) return null;
  return { id: person.id, slug: person.orgSlug, name: person.name, email: account.email };
}

async function ownerFromSupabase(slug: string): Promise<OrgOwner | null> {
  const token = await readAccessToken();
  if (!token) return null;
  const org = await createSupabaseWithAccess(token)
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (!org.data?.name || !org.data.slug) return null;
  const account = await readSessionAccount();
  return {
    id: org.data.id,
    slug: org.data.slug,
    name: org.data.name,
    email: account?.email ?? "",
  };
}
