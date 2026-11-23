"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";

export async function claimSessionAction(sessionId: string) {
  const token = await readAccessToken();
  if (!token) return { error: "Inicia sesión para apartar tu lugar." };
  const db = createSupabaseWithAccess(token);
  const claimed = await db.rpc("claim_session_seat", { p_session_id: sessionId });
  if (claimed.error) {
    const message = claimed.error.message ?? "";
    if (message.includes("cupo_lleno")) return { error: "Ya no hay lugares en esta sesión." };
    if (message.includes("sesion_cerrada")) return { error: "Esta sesión ya no está abierta." };
    if (message.includes("no_aceptada")) return { error: "Tu cuenta todavía no puede apartar lugar sola." };
    return { error: "No se pudo apartar el lugar." };
  }
  revalidatePath("/app/sesiones");
  return { ok: true as const };
}
