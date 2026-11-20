"use server";

import { revalidatePath } from "next/cache";
import { empresarioCompanyDb } from "./own-company";

/** Soft close → cerrado (RLS no deja a la empresa poner oculto; eso es admin). */
export async function hideChallenge(id: string): Promise<string | null> {
  const ctx = await empresarioCompanyDb();
  if (!ctx) return "No se pudo cerrar.";
  const result = await ctx.db
    .from("challenges")
    .update({ status: "cerrado", hidden_at: new Date().toISOString() })
    .eq("id", id)
    .eq("company_id", ctx.company.id)
    .in("status", ["borrador", "publicado"])
    .select("id")
    .maybeSingle();
  if (result.error || !result.data) {
    console.error("hideChallenge", result.error?.message ?? "sin fila");
    return "No se pudo cerrar.";
  }
  revalidatePath("/app/challenges");
  revalidatePath(`/app/challenges/${id}/edit`);
  revalidatePath("/retos");
  return null;
}
