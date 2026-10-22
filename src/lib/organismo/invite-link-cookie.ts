import "server-only";

import { cookies } from "next/headers";

export type InviteLink = { url: string; sector: string };

function key(slug: string) {
  return `org-invite-${slug}`;
}

export async function writeInviteLink(slug: string, link: InviteLink) {
  const jar = await cookies();
  jar.set(key(slug), JSON.stringify(link), { path: "/", httpOnly: true, sameSite: "lax" });
}

export async function readInviteLink(slug: string): Promise<InviteLink | null> {
  const raw = (await cookies()).get(key(slug))?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as InviteLink;
    if (typeof parsed.url !== "string" || typeof parsed.sector !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}
