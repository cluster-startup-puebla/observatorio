"use server";

import { redirect } from "next/navigation";
import { getDirectory } from "./memory-directory";
import { orgView } from "./organismo/crm-view";
import { deliverOrgRsvpPass } from "./organismo/deliver-org-rsvp-pass";
import { requireOrgMember } from "./organismo/member";
import { contactOrgPerson, rejectOrgPerson } from "./organismo/org-crm-write";
import { orgDb } from "./organismo/org-db";
import { ownerBySlug } from "./organismo/owner";
import { sendAcceptedPass } from "./mail/send-accepted-pass";
import { sessionPiecePath } from "./sessions/public-path";
import { readAccessToken, usesSupabaseAuth } from "./supabase/auth-session";

export async function crmEventAction(formData: FormData) {
  const owner = await ownerBySlug(String(formData.get("slug") ?? "").trim());
  if (!owner) redirect("/onboarding");
  const account = await requireOrgMember(owner);
  const personId = String(formData.get("personId") ?? "").trim();
  const event = String(formData.get("event") ?? "");
  const vista = orgView(String(formData.get("vista") ?? "") || undefined);
  const sessionSlug = String(formData.get("sessionSlug") ?? "").trim();
  const failed =
    personId && (event === "contactar" || event === "rechazar" || event === "aceptar")
      ? await applyEvent(owner.id, account.id, personId, event)
      : "";
  const error = failed ? `&error=${failed}` : "";
  const base = sessionSlug ? `${sessionPiecePath(sessionSlug, owner.slug)}/crm` : `/${owner.slug}/crm`;
  redirect(`${base}?vista=${vista}${error}`);
}

async function applyEvent(
  orgId: string,
  actorId: string,
  personId: string,
  event: "contactar" | "rechazar" | "aceptar",
) {
  if (usesSupabaseAuth()) {
    const db = await orgDb();
    if (!db) return "";
    if (event === "aceptar") {
      const approved = await db.rpc("approve_link_signup", { contact_id: personId });
      if (approved.error?.message.includes("sector_lleno")) return "sector_lleno";
      if (approved.error) return "aceptar";
      await deliverOrgRsvpPass(db, personId);
      const token = await readAccessToken();
      if (token) await sendAcceptedPass(token, personId);
      return "";
    }
    if (event === "contactar") await contactOrgPerson(db, actorId, personId);
    if (event === "rechazar") await rejectOrgPerson(db, actorId, personId);
    return "";
  }
  if (event === "aceptar") return "";
  const directory = getDirectory();
  const people = await directory.crm(orgId);
  if (people.some((person) => person.id === personId)) await directory.applyCrm(personId, event);
  return "";
}
