"use server";

import { redirect } from "next/navigation";
import { getDirectory } from "@/lib/memory-directory";
import { handInviteRow } from "./hand-invite";
import { requireOrgMember } from "./member";
import { orgEmailTaken } from "./org-crm-read";
import { ownerBySlug } from "./owner";
import { saveOrgInvites } from "./save-invites";

export async function createHandInviteAction(formData: FormData) {
  const owner = await ownerBySlug(String(formData.get("slug") ?? "").trim());
  if (!owner) redirect("/onboarding");
  const account = await requireOrgMember(owner);
  const row = handInviteRow({
    nombre: String(formData.get("nombre") ?? ""),
    empresa: String(formData.get("empresa") ?? ""),
    correo: String(formData.get("correo") ?? ""),
  });
  const back = `/${owner.slug}/crm?vista=tarjetas`;
  if (!row) redirect(`${back}&error=invitacion`);
  const taken = await orgEmailTaken(owner.id, row.correo);
  const duplicate =
    taken ??
    (await getDirectory().crm(owner.id)).some((person) => person.correo.toLowerCase() === row.correo);
  if (duplicate) redirect(`${back}&error=repetido`);
  const saved = await saveOrgInvites({
    orgId: owner.id,
    actorId: account.id,
    source: "manual",
    rows: [row],
  });
  if (!saved.ok) redirect(`${back}&error=guardar`);
  redirect(back);
}
