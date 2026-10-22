import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getDirectory } from "@/lib/memory-directory";
import { resolveSector } from "@/lib/sectors";
import { readAccountId } from "@/lib/session";

export const instant = false;

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string; error?: string }>;
}) {
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
    >
      <OnboardingWizard
        accountId={account.id}
        role={account.role}
        sectorSlug={resolved.slug}
        sectorName={resolved.name}
        onboarded={account.onboarded}
        missingSize={params.error === "tamano"}
        missingSlug={params.error === "slug"}
        missingLogo={params.error === "logo"}
      />
    </AuthShell>
  );
}
