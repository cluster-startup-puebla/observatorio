import "server-only";

import { getDirectory } from "@/lib/memory-directory";
import { memoryStore } from "@/lib/memory/store";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";

export type OrgOwner = { id: string; slug: string; name: string; email: string };

export async function ownerBySlug(slug: string): Promise<OrgOwner | null> {
  if (usesSupabaseAuth()) return null;
  const person = memoryStore().people.find((item) => item.orgSlug === slug && !item.orgId);
  if (!person?.orgSlug || !person.name) return null;
  const account = await getDirectory().getAccount(person.id);
  if (!account) return null;
  return { id: person.id, slug: person.orgSlug, name: person.name, email: account.email };
}
