"use server";

import { redirect } from "next/navigation";
import { invitesFromEmails } from "./organismo/email-list";
import { getDirectory } from "./memory-directory";
import { readAccountId } from "./session";

export { copyEventLinkAction } from "./organismo/copy-link-action";

async function accountWithSlug() {
  const id = await readAccountId();
  const account = id ? await getDirectory().getAccount(id) : null;
  return { id, slug: account?.orgSlug };
}

function toCrm(slug?: string) {
  redirect(slug ? `/${slug}/crm` : "/onboarding");
}

export async function uploadInvitesAction(formData: FormData) {
  const { id, slug } = await accountWithSlug();
  const file = formData.get("archivo");
  if (!id || !(file instanceof File)) return;
  const text = await file.text();
  const grid = text
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split(",").map((cell) => cell.trim()));
  const [header, ...rows] = grid;
  if (!header) return;
  await getDirectory().importInvites(
    id,
    rows.map((row) => ({
      nombre: row[0] ?? "",
      empresa: row[1] ?? "",
      correo: row[2] ?? "",
    })),
  );
  toCrm(slug);
}

export async function createInviteAction(formData: FormData) {
  const { id, slug } = await accountWithSlug();
  if (!id) return;
  await getDirectory().importInvites(id, [
    {
      nombre: String(formData.get("nombre") ?? ""),
      empresa: String(formData.get("empresa") ?? ""),
      correo: String(formData.get("correo") ?? ""),
    },
  ]);
  toCrm(slug);
}

export async function uploadEmailsAction(formData: FormData) {
  const { id, slug } = await accountWithSlug();
  if (!id || !slug) return;
  const parsed = invitesFromEmails(String(formData.get("correos") ?? ""));
  if (parsed.ok.length === 0) {
    redirect(`/${slug}/invitaciones?error=correos`);
  }
  await getDirectory().importInvites(id, parsed.ok);
  redirect(`/${slug}/crm`);
}
