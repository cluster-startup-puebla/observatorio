"use server";

import { redirect } from "next/navigation";
import { parseInviteSheet } from "./invite-sheet";
import { invitesFromEmails } from "./organismo/email-list";
import { handInviteRow } from "./organismo/hand-invite";
import { orgEmailTaken } from "./organismo/org-crm-read";
import { requireOrgMember } from "./organismo/member";
import { ownerBySlug } from "./organismo/owner";
import { saveOrgInvites } from "./organismo/save-invites";

async function actingOrg(formData: FormData) {
  const owner = await ownerBySlug(String(formData.get("slug") ?? ""));
  if (!owner) redirect("/onboarding");
  const account = await requireOrgMember(owner);
  return { owner, account };
}

function toCrm(slug: string) {
  redirect(`/${slug}/crm`);
}

async function persist(
  owner: { id: string; slug: string },
  actorId: string,
  source: "manual" | "excel",
  rows: { nombre: string; empresa: string; correo: string }[],
  back: string,
) {
  const saved = await saveOrgInvites({ orgId: owner.id, actorId, source, rows });
  if (!saved.ok) redirect(`${back}${back.includes("?") ? "&" : "?"}error=guardar`);
  toCrm(owner.slug);
}

export async function uploadInvitesAction(formData: FormData) {
  const { owner, account } = await actingOrg(formData);
  const file = formData.get("archivo");
  if (!(file instanceof File)) return;
  const text = await file.text();
  const grid = text
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split(",").map((cell) => cell.trim()));
  if (!grid[0]) return;
  const parsed = parseInviteSheet(grid);
  await persist(owner, account.id, "excel", parsed.ok, `/${owner.slug}/invitaciones?modo=archivo`);
}

export async function createInviteAction(formData: FormData) {
  const { owner, account } = await actingOrg(formData);
  const back = `/${owner.slug}/invitaciones`;
  const row = handInviteRow({
    nombre: String(formData.get("nombre") ?? ""),
    empresa: String(formData.get("empresa") ?? ""),
    correo: String(formData.get("correo") ?? ""),
  });
  if (!row) redirect(`${back}?error=invitacion`);
  if (await orgEmailTaken(owner.id, row.correo)) redirect(`${back}?error=repetido`);
  await persist(owner, account.id, "manual", [row], back);
}

export async function uploadEmailsAction(formData: FormData) {
  const { owner, account } = await actingOrg(formData);
  const back = `/${owner.slug}/invitaciones?modo=correos`;
  const parsed = invitesFromEmails(String(formData.get("correos") ?? ""));
  if (parsed.ok.length === 0) redirect(`${back}&error=correos`);
  await persist(owner, account.id, "manual", parsed.ok, back);
}
