"use server";

import { revalidatePath } from "next/cache";
import { empresarioCompanyDb } from "./own-company";

/** Soft delete: status → oculto. No hard delete. */
export async function hideChallenge(id: string): Promise<string | null> {
  const ctx = await empresarioCompanyDb();
  if (!ctx) return "No se pudo ocultar.";
  const result = await ctx.db
    .from("challenges")
    .update({ status: "oculto", hidden_at: new Date().toISOString() })
    .eq("id", id)
    .eq("company_id", ctx.company.id)
    .neq("status", "oculto");
  if (result.error) return "No se pudo ocultar.";
  revalidatePath("/app/challenges");
  revalidatePath(`/app/challenges/${id}/edit`);
  revalidatePath("/retos");
  return null;
}
