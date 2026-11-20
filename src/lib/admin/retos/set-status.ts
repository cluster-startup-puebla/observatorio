"use server";

import { revalidatePath } from "next/cache";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";

export async function setChallengeModeration(
  id: string,
  next: "oculto" | "publicado",
): Promise<string | null> {
  await requireSuperadmin();
  const token = await readAccessToken();
  if (!token) return "No se pudo actualizar.";
  const db = createSupabaseWithAccess(token);
  const patch =
    next === "oculto"
      ? { status: "oculto" as const, hidden_at: new Date().toISOString() }
      : {
          status: "publicado" as const,
          hidden_at: null,
          published_at: new Date().toISOString(),
        };
  const result = await db.from("challenges").update(patch).eq("id", id);
  if (result.error) return "No se pudo actualizar.";
  revalidatePath("/admin/retos");
  revalidatePath("/retos");
  return null;
}
