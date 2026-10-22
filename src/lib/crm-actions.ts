"use server";

import { redirect } from "next/navigation";
import { getDirectory } from "./memory-directory";
import { orgView } from "./organismo/crm-view";
import { requireOrgMember } from "./organismo/member";
import { contactOrgPerson } from "./organismo/org-crm-write";
import { orgDb } from "./organismo/org-db";
import { ownerBySlug } from "./organismo/owner";
import { usesSupabaseAuth } from "./supabase/auth-session";

export async function crmEventAction(formData: FormData) {
  const owner = await ownerBySlug(String(formData.get("slug") ?? "").trim());
  if (!owner) redirect("/onboarding");
  const account = await requireOrgMember(owner);
  const personId = String(formData.get("personId") ?? "").trim();
  const event = String(formData.get("event") ?? "");
  const vista = orgView(String(formData.get("vista") ?? "") || undefined);
  if (personId && (event === "contactar" || event === "rechazar")) {
    await applyEvent(owner.id, account.id, personId, event);
  }
  redirect(`/${owner.slug}/crm?vista=${vista}`);
}

async function applyEvent(orgId: string, actorId: string, personId: string, event: "contactar" | "rechazar") {
  if (usesSupabaseAuth()) {
    const db = await orgDb();
    if (db && event === "contactar") await contactOrgPerson(db, actorId, personId);
    return;
  }
  const directory = getDirectory();
  const people = await directory.crm(orgId);
  if (people.some((person) => person.id === personId)) await directory.applyCrm(personId, event);
}
