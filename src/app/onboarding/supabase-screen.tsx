import { redirect } from "next/navigation";
import { AuthLogout } from "@/components/auth/auth-logout";
import { AuthShell } from "@/components/auth/auth-shell";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { AttendanceSlot } from "@/components/onboarding/attendance-slot";
import { orgSlugForUser } from "@/lib/auth/login-org";
import { readSessionAccount } from "@/lib/auth/session-account";
import { readOrgIntent } from "@/lib/organismo/signup-intent";
import { companyHasLogo } from "@/lib/onboarding/company-has-logo";
import { laterLogoOffer } from "@/lib/onboarding/company-logo";
import { externalPassPending } from "@/lib/onboarding/external-pass-state";
import { issueConfirmedPass } from "@/lib/onboarding/issue-confirmed-pass";
import { linkInviteOutcome } from "@/lib/onboarding/link-pass-state";
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
  const empresario = onboarded && account.role === "empresario";
  const link = empresario ? await linkInviteOutcome(token, account.email) : "pase";
  const attendance = empresario ? await createSupabaseWithAccess(token).rpc("my_attendance_state") : { data: null };
  const pendingExternal = empresario ? await externalPassPending(token, account.id) : false;
  const gate = attendance.data === "cancelo" ? "cancelo" : link === "cerrado" ? "cerrado" : link === "espera" || pendingExternal ? "espera" : "pase";
  const hasLogo =
    empresario && (gate === "espera" || gate === "pase") ? await companyHasLogo(token, account.id) : true;
  const offerLogo = laterLogoOffer({ hasLogo, gate });
  if (onboarded && account.role === "empresario") await issueConfirmedPass(token, account.id, account.email);

  return (
    <AuthShell
      back={false}
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
        gate={gate}
        formError={params.error}
        missingSlug={params.error === "slug"}
        missingLogo={params.error === "logo"}
        brandError={params.error === "marca"}
        termsError={params.error === "terminos"}
        offerLogo={offerLogo}
        logoError={params.error === "logo" ? "logo" : undefined}
      />
      {onboarded && account.role === "empresario" ? <AttendanceSlot token={token} error={params.error} /> : null}
    </AuthShell>
  );
}
