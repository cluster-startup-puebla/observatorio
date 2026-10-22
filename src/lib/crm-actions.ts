"use server";

import { redirect } from "next/navigation";
import { getDirectory } from "./memory-directory";
import { orgView } from "./organismo/crm-view";
import { readAccountId } from "./session";

export async function crmEventAction(formData: FormData) {
  const orgId = await readAccountId();
  const personId = String(formData.get("personId") ?? "").trim();
  const event = String(formData.get("event") ?? "");
  const vista = orgView(String(formData.get("vista") ?? "") || undefined);
  if (orgId && personId && (event === "contactar" || event === "rechazar")) {
    const directory = getDirectory();
    const people = await directory.crm(orgId);
    if (people.some((person) => person.id === personId)) {
      await directory.applyCrm(personId, event);
    }
  }
  const account = orgId ? await getDirectory().getAccount(orgId) : null;
  if (account?.orgSlug) redirect(`/${account.orgSlug}/crm?vista=${vista}`);
  redirect("/onboarding");
}
