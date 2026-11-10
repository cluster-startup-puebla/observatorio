import "server-only";

import { redirect } from "next/navigation";
import { eventOpenForRole } from "./current-event-open";
import { sessionRedirect } from "./session-redirect";
import { readSessionAccount } from "./session-account";

export async function redirectIfSession(path: string) {
  const account = await readSessionAccount();
  const eventOpen = account ? await eventOpenForRole(account.role) : undefined;
  const next = sessionRedirect({
    path,
    account: account
      ? {
          role: account.role,
          onboarded: account.onboarded,
          awaitingApproval: account.awaitingApproval,
          eventOpen,
        }
      : null,
  });
  if (next) redirect(next);
}
