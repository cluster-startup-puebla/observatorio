"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDirectory } from "@/lib/memory-directory";
import { writeInviteLink } from "@/lib/organismo/invite-link-cookie";
import { readAccountId } from "@/lib/session";

export async function copyEventLinkAction(formData: FormData) {
  const id = await readAccountId();
  const account = id ? await getDirectory().getAccount(id) : null;
  if (!id || !account?.orgSlug) return;
  const sector = String(formData.get("sector") ?? "").trim() || "turismo";
  const token = await getDirectory().copyEventLink(id, sector);
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}/${sector}?${token}`;
  await writeInviteLink(account.orgSlug, { url, sector });
  redirect(
    `/${account.orgSlug}?enlace=${encodeURIComponent(url)}&sector=${encodeURIComponent(sector)}`,
  );
}
