"use server";

import { redirect } from "next/navigation";
import { getDirectory } from "./memory-directory";
import { readAccountId } from "./session";

export async function crmEventAction(formData: FormData) {
  const orgId = await readAccountId();
  const personId = String(formData.get("personId") ?? "").trim();
  const event = String(formData.get("event") ?? "");
  if (orgId && personId && (event === "contactar" || event === "rechazar")) {
    const directory = getDirectory();
    const people = await directory.crm(orgId);
    if (people.some((person) => person.id === personId)) {
      await directory.applyCrm(personId, event);
    }
  }
  redirect("/organismo/crm");
}
