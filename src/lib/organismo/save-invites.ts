import "server-only";

import type { InviteInput } from "@/lib/directory";
import { getDirectory } from "@/lib/memory-directory";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { orgDb } from "./org-db";
import { importOrgInvites } from "./org-crm-write";

export async function saveOrgInvites(input: {
  orgId: string;
  actorId: string;
  source: "manual" | "excel";
  rows: InviteInput[];
}) {
  if (!usesSupabaseAuth()) {
    await getDirectory().importInvites(input.orgId, input.rows);
    return { ok: true as const };
  }
  const db = await orgDb();
  if (!db) return { ok: false as const, reason: "sin sesión" };
  return importOrgInvites(db, input);
}
