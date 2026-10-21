"use server";

import { redirect } from "next/navigation";
import { getDirectory } from "./memory-directory";
import { readAccountId } from "./session";

export async function uploadInvitesAction(formData: FormData) {
  const id = await readAccountId();
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
  redirect("/organismo/crm");
}

export async function copyEventLinkAction() {
  const id = await readAccountId();
  if (!id) return "";
  const account = await getDirectory().getAccount(id);
  return getDirectory().copyEventLink(id, account?.sectorSlug || "general");
}
