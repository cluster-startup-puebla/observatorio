import "server-only";

import { redirect } from "next/navigation";
import { readSessionAccount } from "@/lib/auth/session-account";
import type { OrgOwner } from "./owner";

export async function requireOrgMember(owner: OrgOwner) {
  const account = await readSessionAccount();
  if (!account) redirect(`/login?next=/${owner.slug}`);
  if (account.id !== owner.id) redirect("/organismo");
  return account;
}
