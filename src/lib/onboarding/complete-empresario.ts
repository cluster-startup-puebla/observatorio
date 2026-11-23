"use server";

import { redirect } from "next/navigation";
import { readSessionAccount } from "@/lib/auth/session-account";
import { attributeSignup } from "@/lib/organismo/attribute-signup";
import { finishInMemory } from "./complete-empresario-memory";
import { createSupabaseWithAccess, readAccessToken, usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { empresarioErrors, parseEmpresarioForm, type EmpresarioProfile } from "./empresario-draft";
import { inviteToken } from "./invite-token";
import { issueConfirmedPass } from "./issue-confirmed-pass";
import { syncAttachedRsvps } from "./sync-attached-rsvps";
import { saveCompanyLogo } from "./save-company-logo";
import { saveEmpresarioProfile } from "./save-empresario";

function back(reason: string, profile: EmpresarioProfile, token: string) {
  const query = new URLSearchParams({ error: reason });
  if (profile.sectorSlug) query.set("sector", profile.sectorSlug);
  if (token) query.set("invitacion", token);
  redirect(`/onboarding?${query.toString()}`);
}

async function finishInSupabase(profile: EmpresarioProfile, token: string, formData: FormData) {
  const session = await readSessionAccount();
  const access = await readAccessToken();
  if (!session || session.role !== "empresario" || !access) back("cuenta", profile, token);
  const logo = await saveCompanyLogo({
    accessToken: access!,
    profileId: session!.id,
    file: formData.get("logo"),
    show: formData.get("showLogo") === "1",
  });
  if (!logo.ok) back("logo", profile, token);
  const saved = await saveEmpresarioProfile(access!, session!.id, profile, Boolean(token), logo.show ?? false);
  if (!saved.ok) back(saved.reason, profile, token);
  await syncAttachedRsvps(access!, session!.id, session!.email);
  if (token) {
    await attributeSignup({
      token,
      email: session!.email,
      sectorSlug: profile.sectorSlug,
      nombre: profile.fullName,
      empresa: profile.companyName,
    });
  }
  await issueConfirmedPass(access!, session!.id, session!.email);
}

export async function completeEmpresarioAction(formData: FormData) {
  const id = String(formData.get("accountId") ?? "");
  const profile = parseEmpresarioForm(formData);
  const token = await inviteToken(formData);
  const supabase = usesSupabaseAuth();
  const reason =
    empresarioErrors(profile) ??
    (formData.get("terminos") === "si" ? null : "terminos") ??
    (!supabase && !id ? "cuenta" : null);
  if (reason) back(reason, profile, token);
  if (supabase) await finishInSupabase(profile, token, formData);
  else await finishInMemory(id, profile, token);
  redirect("/onboarding");
}
