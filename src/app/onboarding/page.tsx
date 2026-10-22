import { redirect } from "next/navigation";
import { AuthLogout } from "@/components/auth/auth-logout";
import { AuthShell } from "@/components/auth/auth-shell";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getDirectory } from "@/lib/memory-directory";
import { resolveSector } from "@/lib/sectors";
import { readAccountId } from "@/lib/session";
import { readAccessToken, usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { SupabaseOnboarding } from "./supabase-screen";

export const instant = false;

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string; error?: string; invitacion?: string }>;
}) {
  if (usesSupabaseAuth() && (await readAccessToken())) {
    return <SupabaseOnboarding searchParams={searchParams} />;
  }
  const id = await readAccountId();
  if (!id) redirect("/register");
  const account = await getDirectory().getAccount(id);
  if (!account) redirect("/register");
  const params = await searchParams;
  const resolved = resolveSector({
    pathSector: params.sector,
    chosen: account.sectorSlug,
  });

  return (
    <AuthShell
      kicker="Tu perfil"
      title={account.role === "director" ? "La marca de tu organismo" : "Tu empresa en la sesión"}
      lead="Un paso más y el lugar queda apartado."
      footer={<AuthLogout />}
    >
      <OnboardingWizard
        accountId={account.id}
        role={account.role}
        sectorSlug={resolved.slug}
        sectorName={resolved.name}
        invitacion={params.invitacion}
        onboarded={account.onboarded}
        formError={params.error}
        missingSlug={params.error === "slug"}
        missingLogo={params.error === "logo"}
      />
    </AuthShell>
  );
}
