"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { accountErrors } from "./account-draft";
import { getDirectory } from "./memory-directory";
import { empresarioErrors, parseEmpresarioForm } from "./onboarding/empresario-draft";
import { finishOrganismoBrand } from "./organismo/finish-brand";
import { saveDirectorLogo } from "./organismo/memory-logo";
import { orgSlug, slugError } from "./organismo/slug";
import { signupOrganismoAndSession } from "./organismo/signup-organismo";
import { sectors } from "./sectors";
import { writeAccountId } from "./session";
import { usesSupabaseAuth } from "./supabase/auth-session";

export type AccountFormState = {
  errors?: { email?: string; password?: string };
  error?: string;
  next?: string;
} | null;

export async function createAccountAction(
  _previous: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const email = String(formData.get("correo") ?? "");
  const password = String(formData.get("contrasena") ?? "");
  const errors = accountErrors({ email, password });
  if (errors) return { errors };

  const isOrganismo = formData.get("cuenta") === "organismo";
  const sector = String(formData.get("sector") ?? "").trim();
  if (usesSupabaseAuth() && isOrganismo) return signupOrganismoAndSession(email, password, sector);

  const role = isOrganismo ? "director" : "empresario";
  const account = await getDirectory().createAccount({ email, role });
  await writeAccountId(account.id);
  return { next: sector ? `/onboarding?sector=${encodeURIComponent(sector)}` : "/onboarding" };
}

export async function completeEmpresarioAction(formData: FormData) {
  const id = String(formData.get("accountId") ?? "");
  const profile = parseEmpresarioForm(formData);
  const reason = !id ? "cuenta" : empresarioErrors(profile);
  if (reason) {
    const query = new URLSearchParams({ error: reason });
    if (profile.sectorSlug) query.set("sector", profile.sectorSlug);
    redirect(`/onboarding?${query.toString()}`);
  }
  await getDirectory().completeOnboarding(id, {
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
  });
  redirect("/onboarding");
}

export async function completeOrganismoAction(formData: FormData) {
  if (usesSupabaseAuth()) return finishOrganismoBrand(formData);

  const id = String(formData.get("accountId") ?? "");
  const name = String(formData.get("nombre") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();
  if (!id || name.length < 2 || !color) redirect("/onboarding?error=marca");
  const slug = orgSlug(name, "");
  if (slugError(slug, sectors.map((s) => s.slug))) redirect("/onboarding?error=slug");
  if (!(await saveDirectorLogo(id, formData.get("logo")))) redirect("/onboarding?error=logo");
  await getDirectory().completeOnboarding(id, {
    sectorSlug: "general",
    size: "organismo",
    name,
    logoKey: `logos/${id}`,
    slug,
  });
  const jar = await cookies();
  jar.set("org-slug", slug, { path: "/", httpOnly: true, sameSite: "lax" });
  redirect(`/${slug}`);
}
