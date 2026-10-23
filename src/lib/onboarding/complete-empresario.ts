"use server";

import { redirect } from "next/navigation";
import { readSessionAccount } from "@/lib/auth/session-account";
import { getDirectory } from "@/lib/memory-directory";
import { attributeSignup } from "@/lib/organismo/attribute-signup";
import { readAccessToken, usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { empresarioErrors, parseEmpresarioForm, type EmpresarioProfile } from "./empresario-draft";
import { logoUploadDecision } from "./company-logo";
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
  if (token) {
    await attributeSignup({
      token,
      email: session!.email,
      sectorSlug: profile.sectorSlug,
      nombre: profile.fullName,
      empresa: profile.companyName,
    });
  }
}

async function finishInMemory(id: string, profile: EmpresarioProfile, token: string) {
  const directory = getDirectory();
  const session = await readSessionAccount();
  await directory.completeOnboarding(id, {
    sectorSlug: profile.sectorSlug,
    size: profile.employeeBand,
    name: profile.fullName,
    jobTitle: profile.jobTitle,
    whatsapp: profile.whatsapp || undefined,
    companyName: profile.companyName,
    marketSize: profile.marketSize,
    municipality: profile.municipality,
    referralSource: profile.referralSource,
    sessionInterest: profile.sessionInterest,
    email: session?.email,
  });
  const account = await directory.getAccount(id);
  if (account?.onboarded && token) {
    await directory.attributeRegistration({ token, email: account.email, sectorSlug: profile.sectorSlug });
  }
}

export async function completeEmpresarioAction(formData: FormData) {
  const id = String(formData.get("accountId") ?? "");
  const profile = parseEmpresarioForm(formData);
  const token = String(formData.get("invitacion") ?? "").trim();
  const supabase = usesSupabaseAuth();
  const file = formData.get("logo");
  const decision = logoUploadDecision({
    show: formData.get("showLogo") === "1",
    hasFile: file instanceof File && file.size > 0,
  });
  const reason = decision.action === "reject" ? "logo" : empresarioErrors(profile) ?? (!supabase && !id ? "cuenta" : null);
  if (reason) back(reason, profile, token);
  if (supabase) await finishInSupabase(profile, token, formData);
  else await finishInMemory(id, profile, token);
  redirect("/onboarding");
}
