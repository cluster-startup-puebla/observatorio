import "server-only";

import type { CrmPerson } from "@/lib/directory";
import { orgDb } from "./org-db";
import { orgCrmSessionEmails } from "./org-crm-session-emails";
import { toCrmPeople, type ContactRow, type StatusRow } from "./org-crm-rows";

export async function listOrgCrm(orgId: string, sessionId?: string | null): Promise<CrmPerson[] | null> {
  const db = await orgDb();
  if (!db) return null;
  const contacts = await db
    .from("crm_contacts")
    .select("id, nombre, empresa, email, source, sectors(slug)")
    .eq("organization_id", orgId);
  if (contacts.error) throw new Error(contacts.error.message);
  let rows = (contacts.data ?? []) as ContactRow[];
  if (sessionId) {
    const allowed = await orgCrmSessionEmails(db, orgId, sessionId);
    rows = rows.filter((row) => allowed.has(String(row.email ?? "").trim().toLowerCase()));
  }
  const ids = rows.map((row) => row.id);
  const status = ids.length
    ? await db.from("crm_contact_status").select("contact_id, status").in("contact_id", ids)
    : { data: [], error: null };
  if (status.error) throw new Error(status.error.message);
  return toCrmPeople(rows, (status.data ?? []) as StatusRow[]);
}

export async function orgEmailTaken(orgId: string, email: string) {
  const db = await orgDb();
  if (!db) return null;
  const existing = await db
    .from("crm_contacts")
    .select("id")
    .eq("organization_id", orgId)
    .eq("email", email)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  return Boolean(existing.data);
}
