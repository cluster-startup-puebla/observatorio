import { redirect } from "next/navigation";
import { orgSlugForUser } from "@/lib/auth/login-org";
import { readSessionAccount } from "@/lib/auth/session-account";
import { getDirectory } from "@/lib/memory-directory";
import { readAccountId } from "@/lib/session";
import { readAccessToken, usesSupabaseAuth } from "@/lib/supabase/auth-session";

export const instant = false;

export default async function OrganismoRedirect() {
  if (usesSupabaseAuth()) {
    const account = await readSessionAccount();
    const token = await readAccessToken();
    if (!account || !token) redirect("/login?next=/organismo");
    const slug = await orgSlugForUser(token, account.id);
    if (slug) redirect(`/${slug}`);
    redirect("/onboarding");
  }
  const id = await readAccountId();
  const account = id ? await getDirectory().getAccount(id) : null;
  if (account?.orgSlug) redirect(`/${account.orgSlug}`);
  redirect("/onboarding");
}
