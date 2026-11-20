"use server";

import { revalidatePath } from "next/cache";
import { validateChallengeInput } from "@/lib/challenges/validate";
import { sanitizeChallengeHtml } from "@/lib/html/sanitize-challenge-html";
import { contentFields, type ChallengeFormInput } from "./challenge-form-input";
import { empresarioCompanyDb } from "./own-company";

export async function publishChallenge(form: ChallengeFormInput): Promise<string | null> {
  const ctx = await empresarioCompanyDb();
  if (!ctx) return "No se pudo publicar.";
  const html = sanitizeChallengeHtml(form.descriptionHtml);
  const checked = validateChallengeInput({
    ...form,
    descriptionHtml: html,
    urgency: form.urgency || null,
  });
  if (!checked.ok) return checked.error;

  const now = new Date().toISOString();
  const row = {
    ...contentFields(form, html, ctx.company.sector_id, ctx.company.legal_name),
    status: "publicado" as const,
    published_at: now,
    hidden_at: null,
    company_id: ctx.company.id,
    created_by: ctx.account.id,
  };

  const result = form.id
    ? await ctx.db
        .from("challenges")
        .update(row)
        .eq("id", form.id)
        .eq("company_id", ctx.company.id)
        .in("status", ["borrador", "publicado", "cerrado"])
        .select("id")
        .maybeSingle()
    : await ctx.db.from("challenges").insert(row).select("id").single();
  if (result.error || !result.data) return "No se pudo publicar.";

  const { awardLavasForChallengePublish } = await import(
    "@/lib/lavas/award-challenge-publish"
  );
  await awardLavasForChallengePublish({
    companyId: ctx.company.id,
    challengeId: result.data.id,
    origen: "live",
  });

  revalidatePath("/app/challenges");
  revalidatePath("/retos");
  return null;
}
