"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { identityTag } from "@/lib/app/load-identity";
import { readSessionAccount } from "@/lib/auth/session-account";
import { saveCompanyLogo } from "@/lib/onboarding/save-company-logo";
import { serverIssue } from "@/lib/onboarding/step-issue";
import { websiteError } from "@/lib/onboarding/website";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";

export type GapFormState = { error: string } | null;

const home = "/app/home";

async function actor() {
  const account = await readSessionAccount();
  const accessToken = await readAccessToken();
  if (!account || account.role !== "empresario" || !accessToken) return null;
  return { profileId: account.id, accessToken };
}

function done(profileId: string): never {
  updateTag(identityTag(profileId));
  revalidatePath(home);
  redirect(home);
}

export async function saveProfileLogo(_previous: GapFormState, formData: FormData): Promise<GapFormState> {
  const current = await actor();
  if (!current) return { error: serverIssue("cuenta") };
  const saved = await saveCompanyLogo({
    accessToken: current.accessToken,
    profileId: current.profileId,
    file: formData.get("logo"),
    show: true,
  });
  if (!saved.ok) return { error: serverIssue(saved.reason) };
  done(current.profileId);
}

export async function saveProfileWebsite(_previous: GapFormState, formData: FormData): Promise<GapFormState> {
  const current = await actor();
  if (!current) return { error: serverIssue("cuenta") };
  const website = String(formData.get("website") ?? "").trim();
  const issue = websiteError(website);
  if (issue) return { error: serverIssue(issue) };
  const saved = await createSupabaseWithAccess(current.accessToken)
    .from("companies")
    .update({ website })
    .eq("profile_id", current.profileId)
    .select("id")
    .maybeSingle();
  if (saved.error || !saved.data) return { error: "No se pudo guardar el sitio web." };
  done(current.profileId);
}
