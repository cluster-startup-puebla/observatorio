import "server-only";

import { readSessionAccount } from "@/lib/auth/session-account";
import { getDirectory } from "@/lib/memory-directory";
import { memoryStore } from "@/lib/memory/store";
import { createSupabaseAnon, usesSupabaseAuth } from "@/lib/supabase/auth-session";

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
  const result = await createSupabaseAnon().rpc("organization_by_slug", { org_slug: slug });
  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  if (result.error || !row?.id || !row.name || !row.slug) return null;
  const account = await readSessionAccount();
  return { id: row.id, slug: row.slug, name: row.name, email: account?.email ?? "" };
}
