"use server";

import { redirect } from "next/navigation";
import { readSessionAccount } from "@/lib/auth/session-account";
import { getDirectory } from "@/lib/memory-directory";
import { empresarioErrors, parseEmpresarioForm } from "./empresario-draft";

export async function completeEmpresarioAction(formData: FormData) {
  const id = String(formData.get("accountId") ?? "");
  const profile = parseEmpresarioForm(formData);
  const token = String(formData.get("invitacion") ?? "").trim();
  const reason = !id ? "cuenta" : empresarioErrors(profile);
  if (reason) {
    const query = new URLSearchParams({ error: reason });
    if (profile.sectorSlug) query.set("sector", profile.sectorSlug);
    if (token) query.set("invitacion", token);
    redirect(`/onboarding?${query.toString()}`);
  }
  const directory = getDirectory();
  const session = await readSessionAccount();
  await directory.completeOnboarding(id, {
    sectorSlug: profile.sectorSlug,
    size: profile.employeeBand,
    name: profile.fullName,
    jobTitle: profile.jobTitle,
    whatsapp: profile.whatsapp || undefined,
    companyName: profile.companyName,
    marketSize: profile.marketSize,
    municipality: profile.municipality,
    referralSource: profile.referralSource,
    sessionInterest: profile.sessionInterest,
    email: session?.email,
  });
  const account = await directory.getAccount(id);
  if (account?.onboarded && token) {
    await directory.attributeRegistration({
      token,
      email: account.email,
      sectorSlug: profile.sectorSlug,
    });
  }
  redirect("/onboarding");
}
