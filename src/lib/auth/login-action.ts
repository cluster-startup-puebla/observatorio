"use server";

import { redirect } from "next/navigation";
import { accountErrors } from "@/lib/account-draft";
import { getDirectory } from "@/lib/memory-directory";
import { writeAccountId } from "@/lib/session";
import {
  createSupabaseWithAccess,
  usesSupabaseAuth,
  writeSupabaseSession,
} from "@/lib/supabase/auth-session";
import { awaitingSessionApproval } from "./awaiting-approval";
import { currentEventOpen } from "./current-event-open";
import { pathAfterSignIn } from "./home";
import { inviteFromMetadata, withInvite } from "./invite-carry";
import { orgSlugForUser, setOrgSlugCookie } from "./login-org";
import { signInWithPassword } from "./sign-in";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("correo") ?? "");
  const password = String(formData.get("contrasena") ?? "");
  const errors = accountErrors({ email, password });
  if (errors?.email) redirect("/login?error=correo");
  if (errors?.password) redirect("/login?error=contrasena");

  if (!usesSupabaseAuth()) {
    const result = await getDirectory().loginAccount({ email, password });
    if (!result.ok) redirect("/login?error=credenciales");
    await writeAccountId(result.id);
    const account = await getDirectory().getAccount(result.id);
    if (account?.orgSlug) await setOrgSlugCookie(account.orgSlug);
    redirect(
      pathAfterSignIn({
        role: result.role,
        slug: account?.orgSlug,
        onboarded: Boolean(account?.onboarded),
      }),
    );
  }

  const signed = await signInWithPassword(email, password);
  if (!signed.ok) {
    if (signed.reason === "confirmar") {
      redirect(`/verificar?correo=${encodeURIComponent(email.trim().toLowerCase())}`);
    }
    redirect(`/login?error=${signed.reason}`);
  }
  await writeSupabaseSession(signed.session);
  const slug = await orgSlugForUser(signed.session.access_token, signed.session.user.id);
  if (slug) await setOrgSlugCookie(slug);
  const profile = await createSupabaseWithAccess(signed.session.access_token)
    .from("profiles")
    .select("onboarded_at")
    .eq("id", signed.session.user.id)
    .maybeSingle();
  const onboarded = Boolean(profile.data?.onboarded_at);
  const awaitingApproval =
    signed.role === "empresario" && onboarded
      ? await awaitingSessionApproval({
          token: signed.session.access_token,
          email: signed.session.user.email ?? email.trim().toLowerCase(),
          profileId: signed.session.user.id,
        })
      : false;
  const carried = inviteFromMetadata(signed.session.user.user_metadata);
  const eventOpen = await currentEventOpen();
  redirect(
    withInvite(pathAfterSignIn({ role: signed.role, slug, onboarded, awaitingApproval, eventOpen }), carried),
  );
}
