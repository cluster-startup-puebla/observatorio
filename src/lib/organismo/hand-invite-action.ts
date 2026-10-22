"use server";

import { redirect } from "next/navigation";
import { getDirectory } from "@/lib/memory-directory";
import { handInviteRow } from "./hand-invite";
import { requireOrgMember } from "./member";
import { ownerBySlug } from "./owner";

export async function createHandInviteAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  const owner = await ownerBySlug(slug);
  if (!owner) redirect("/onboarding");
  await requireOrgMember(owner);
  const row = handInviteRow({
    nombre: String(formData.get("nombre") ?? ""),
    empresa: String(formData.get("empresa") ?? ""),
    correo: String(formData.get("correo") ?? ""),
  });
  const back = `/${owner.slug}/crm?vista=tarjetas`;
  if (!row) redirect(`${back}&error=invitacion`);
  const people = await getDirectory().crm(owner.id);
  if (people.some((person) => person.correo.toLowerCase() === row.correo)) {
    redirect(`${back}&error=repetido`);
  }
  await getDirectory().importInvites(owner.id, [row]);
  redirect(back);
}
