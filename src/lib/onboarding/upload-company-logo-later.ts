"use server";

import { redirect } from "next/navigation";
import { readSessionAccount } from "@/lib/auth/session-account";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";
import { logoUploadDecision } from "./company-logo";
import { saveCompanyLogo } from "./save-company-logo";

function fail() {
  redirect("/onboarding?error=logo");
}

export async function uploadCompanyLogoLater(formData: FormData) {
  const session = await readSessionAccount();
  const access = await readAccessToken();
  if (!session || session.role !== "empresario" || !access) fail();
  const db = createSupabaseWithAccess(access!);
  const profile = await db.from("profiles").select("onboarded_at").eq("id", session!.id).maybeSingle();
  if (!profile.data?.onboarded_at) fail();

  const show = formData.get("showLogo") === "1";
  const file = formData.get("logo");
  const decision = logoUploadDecision({ show, hasFile: file instanceof File && file.size > 0 });
  if (decision.action !== "store") fail();

  const logo = await saveCompanyLogo({
    accessToken: access!,
    profileId: session!.id,
    file,
    show,
  });
  if (!logo.ok) fail();
  const saved = await db
    .from("companies")
    .update({ show_logo_on_event: logo.show ?? false })
    .eq("profile_id", session!.id)
    .select("id")
    .maybeSingle();
  if (saved.error || !saved.data) fail();
  redirect("/onboarding");
}
