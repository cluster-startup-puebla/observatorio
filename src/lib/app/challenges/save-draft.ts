"use server";

import { revalidatePath } from "next/cache";
import { validateChallengeInput } from "@/lib/challenges/validate";
import { sanitizeChallengeHtml } from "@/lib/html/sanitize-challenge-html";
import { contentFields, type ChallengeFormInput } from "./challenge-form-input";
import { empresarioCompanyDb } from "./own-company";

export async function saveChallengeDraft(form: ChallengeFormInput): Promise<string | null> {
  const ctx = await empresarioCompanyDb();
  if (!ctx) return "No se pudo guardar.";
  const html = sanitizeChallengeHtml(form.descriptionHtml);
  const checked = validateChallengeInput({
    ...form,
    descriptionHtml: html,
    urgency: form.urgency || null,
  });
  if (!checked.ok) return checked.error;

  const fields = contentFields(form, html, ctx.company.sector_id, ctx.company.legal_name);
  const { company_name_snapshot: _snap, ...draftFields } = fields;
  const result = form.id
    ? await ctx.db
        .from("challenges")
        .update(draftFields)
        .eq("id", form.id)
        .eq("company_id", ctx.company.id)
        .eq("status", "borrador")
    : await ctx.db.from("challenges").insert({
        ...draftFields,
        status: "borrador",
        company_id: ctx.company.id,
        created_by: ctx.account.id,
      });

  if (result.error) return "No se pudo guardar.";
  revalidatePath("/app/challenges");
  return null;
}
