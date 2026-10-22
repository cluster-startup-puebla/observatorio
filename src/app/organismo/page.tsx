import { redirect } from "next/navigation";
import { getDirectory } from "@/lib/memory-directory";
import { readAccountId } from "@/lib/session";

export const instant = false;

export default async function OrganismoRedirect() {
  const id = await readAccountId();
  const account = id ? await getDirectory().getAccount(id) : null;
  if (account?.orgSlug) redirect(`/${account.orgSlug}`);
  redirect("/onboarding");
}
