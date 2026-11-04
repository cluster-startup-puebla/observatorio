import "server-only";

import { redirect } from "next/navigation";
import { sessionRedirect } from "./session-redirect";
import { readSessionAccount } from "./session-account";

export async function redirectIfSession(path: string) {
  const account = await readSessionAccount();
  const next = sessionRedirect({
    path,
    account: account
      ? { role: account.role, onboarded: account.onboarded, awaitingApproval: account.awaitingApproval }
      : null,
  });
  if (next) redirect(next);
}
