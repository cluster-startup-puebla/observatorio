"use server";

import { revalidatePath } from "next/cache";
import { empresarioCompanyDb } from "./own-company";

export async function closeChallenge(id: string): Promise<string | null> {
  const ctx = await empresarioCompanyDb();
  if (!ctx) return "No se pudo cerrar.";
  const result = await ctx.db
    .from("challenges")
    .update({ status: "cerrado" })
    .eq("id", id)
    .eq("company_id", ctx.company.id)
    .eq("status", "publicado");
  if (result.error) return "No se pudo cerrar.";
  revalidatePath("/app/challenges");
  revalidatePath("/retos");
  return null;
}
