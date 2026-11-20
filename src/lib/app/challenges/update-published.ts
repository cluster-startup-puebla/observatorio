"use server";

import { revalidatePath } from "next/cache";
import { validateChallengeInput } from "@/lib/challenges/validate";
import { sanitizeChallengeHtml } from "@/lib/html/sanitize-challenge-html";
import { contentFields, type ChallengeFormInput } from "./challenge-form-input";
import { empresarioCompanyDb } from "./own-company";

export async function updatePublishedChallenge(
  form: ChallengeFormInput,
): Promise<string | null> {
  if (!form.id) return "No se pudo actualizar.";
  const ctx = await empresarioCompanyDb();
  if (!ctx) return "No se pudo actualizar.";
  const html = sanitizeChallengeHtml(form.descriptionHtml);
  const checked = validateChallengeInput({
    ...form,
    descriptionHtml: html,
    urgency: form.urgency || null,
  });
  if (!checked.ok) return checked.error;

  const fields = contentFields(form, html, ctx.company.sector_id, ctx.company.legal_name);
  const result = await ctx.db
    .from("challenges")
    .update(fields)
    .eq("id", form.id)
    .eq("company_id", ctx.company.id)
    .eq("status", "publicado");
  if (result.error) return "No se pudo actualizar.";
  revalidatePath("/app/challenges");
  revalidatePath("/retos");
  return null;
}
