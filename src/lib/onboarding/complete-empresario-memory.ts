import "server-only";

import { readSessionAccount } from "@/lib/auth/session-account";
import { getDirectory } from "@/lib/memory-directory";
import type { EmpresarioProfile } from "./empresario-draft";

export async function finishInMemory(id: string, profile: EmpresarioProfile, token: string) {
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
    await directory.attributeRegistration({ token, email: account.email, sectorSlug: profile.sectorSlug });
  }
}