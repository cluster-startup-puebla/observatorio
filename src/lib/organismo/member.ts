import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readSessionAccount } from "@/lib/auth/session-account";
import type { OrgOwner } from "./owner";

export async function requireOrgMember(owner: OrgOwner) {
  const account = await readSessionAccount();
  if (!account) redirect(`/login?next=/${owner.slug}`);
  if (account.id !== owner.id) redirect("/organismo");
  const jar = await cookies();
  jar.set("org-slug", owner.slug, { path: "/", httpOnly: true, sameSite: "lax" });
  return account;
}
