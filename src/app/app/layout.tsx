import { redirect } from "next/navigation";
import { EmpresarioShell } from "@/components/app/empresario-shell";
import { homeForRole } from "@/lib/auth/home";
import { orgSlugForUser } from "@/lib/auth/login-org";
import { readSessionAccount } from "@/lib/auth/session-account";
import { readAccessToken } from "@/lib/supabase/auth-session";

export const instant = false;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const account = await readSessionAccount();
  if (!account) redirect("/login");
  if (account.role === "empresario" && !account.onboarded) redirect("/onboarding");
  if (account.role !== "empresario") {
    const token = await readAccessToken();
    const slug = token ? await orgSlugForUser(token, account.id) : null;
    redirect(homeForRole(account.role, slug));
  }

  return <EmpresarioShell email={account.email}>{children}</EmpresarioShell>;
}
