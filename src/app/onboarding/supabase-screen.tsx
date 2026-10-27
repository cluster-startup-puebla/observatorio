import { redirect } from "next/navigation";
import { AuthLogout } from "@/components/auth/auth-logout";
import { AuthShell } from "@/components/auth/auth-shell";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { AttendanceSlot } from "@/components/onboarding/attendance-slot";
import { orgSlugForUser } from "@/lib/auth/login-org";
import { readSessionAccount } from "@/lib/auth/session-account";
import { readOrgIntent } from "@/lib/organismo/signup-intent";
import { externalPassPending } from "@/lib/onboarding/external-pass-state";
import { linkPassPending } from "@/lib/onboarding/link-pass-state";
import { resolveSector } from "@/lib/sectors";
import { createSupabaseAnon, createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";

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
  const finished = await createSupabaseWithAccess(token)
    .from("profiles")
    .select("onboarded_at")
    .eq("id", account.id)
    .maybeSingle();

  const onboarded = !org && Boolean(finished.data?.onboarded_at);
  const pendingLink = onboarded && account.role === "empresario" ? await linkPassPending(token, account.email) : false;
  const pendingExternal = onboarded && account.role === "empresario" ? await externalPassPending(token, account.id) : false;
  const pending = pendingLink || pendingExternal;

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
        invitacion={params.invitacion}
        onboarded={onboarded}
        pending={pending}
        formError={params.error}
        missingSlug={params.error === "slug"}
        missingLogo={params.error === "logo"}
        brandError={params.error === "marca"}
      />
      {onboarded && account.role === "empresario" ? <AttendanceSlot token={token} error={params.error} /> : null}
    </AuthShell>
  );
}
