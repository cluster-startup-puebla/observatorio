"use server";

import { redirect } from "next/navigation";
import { accountErrors } from "./account-draft";
import { getDirectory } from "./memory-directory";
import { writeAccountId } from "./session";

export type AccountFormState = { errors: { email?: string; password?: string } } | null;

export async function createAccountAction(
  _previous: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const email = String(formData.get("correo") ?? "");
  const password = String(formData.get("contrasena") ?? "");
  const errors = accountErrors({ email, password });
  if (errors) return { errors };

  const role = formData.get("cuenta") === "organismo" ? "director" : "empresario";
  const account = await getDirectory().createAccount({ email, role });
  await writeAccountId(account.id);
  const sector = String(formData.get("sector") ?? "").trim();
  redirect(sector ? `/onboarding?sector=${encodeURIComponent(sector)}` : "/onboarding");
}

export async function completeEmpresarioAction(formData: FormData) {
  const id = String(formData.get("accountId") ?? "");
  const sectorSlug = String(formData.get("sector") ?? "");
  const size = String(formData.get("size") ?? "");
  if (!id || !sectorSlug || !size) {
    const query = new URLSearchParams({ error: "tamano" });
    if (sectorSlug) query.set("sector", sectorSlug);
    redirect(`/onboarding?${query.toString()}`);
  }
  await getDirectory().completeOnboarding(id, { sectorSlug, size });
  redirect("/onboarding");
}

export async function completeOrganismoAction(formData: FormData) {
  const id = String(formData.get("accountId") ?? "");
  const name = String(formData.get("nombre") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();
  const logo = formData.get("logo");
  const hasLogo = logo instanceof File && logo.size > 0;
  if (!id || name.length < 2 || !color || !hasLogo) return { ok: false as const };
  await getDirectory().completeOnboarding(id, {
    sectorSlug: "general",
    size: "organismo",
    name,
    logoKey: `logos/${id}`,
  });
  redirect("/organismo");
}
