import "server-only";

import { getDirectory } from "@/lib/memory-directory";
import { readAccountId } from "@/lib/session";

export async function captureFinishedInvite(token: string, sectorSlug: string) {
  const id = await readAccountId();
  if (!id) return;
  const account = await getDirectory().getAccount(id);
  if (!account?.onboarded || account.role !== "empresario") return;
  await getDirectory().attributeRegistration({ token, email: account.email, sectorSlug });
}
