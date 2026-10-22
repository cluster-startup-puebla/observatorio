import { redirect } from "next/navigation";
import { AuthLogout } from "@/components/auth/auth-logout";
import { AuthShell } from "@/components/auth/auth-shell";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { orgSlugForUser } from "@/lib/auth/login-org";
import { readSessionAccount } from "@/lib/auth/session-account";
import { readOrgIntent } from "@/lib/organismo/signup-intent";
import { resolveSector } from "@/lib/sectors";
import { createSupabaseAnon, readAccessToken } from "@/lib/supabase/auth-session";

export async function SupabaseOnboarding({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string; error?: string; invitacion?: string }>;
}) {
  const account = await readSessionAccount();
  const token = await readAccessToken();
  if (!account || !token) redirect("/login?next=/onboarding");

  if (account.role === "director") {
    const slug = await orgSlugForUser(token, account.id);
    if (slug) redirect(`/${slug}`);
  }

  const user = await createSupabaseAnon().auth.getUser(token);
  const intent = user.data.user?.user_metadata?.intent;
  const org = account.role === "director" || intent === "organismo" || (await readOrgIntent());
  const params = await searchParams;
  const resolved = resolveSector({ pathSector: params.sector });

  return (
    <AuthShell
      kicker="Tu perfil"
      title={org ? "La marca de tu organismo" : "Tu empresa en la sesión"}
      lead="Un paso más y el lugar queda apartado."
      footer={<AuthLogout />}
    >
      <OnboardingWizard
        accountId={account.id}
        role={org ? "director" : account.role}
        sectorSlug={resolved.slug}
        sectorName={resolved.name}
        sectorLocked={resolved.locked}
        invitacion={params.invitacion}
        onboarded={false}
        formError={params.error}
        missingSlug={params.error === "slug"}
        missingLogo={params.error === "logo"}
        brandError={params.error === "marca"}
      />
    </AuthShell>
  );
}
