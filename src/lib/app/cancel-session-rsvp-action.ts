"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";

const errors: Record<string, string> = {
  motivo: "Escribe por qué cancelas.",
  todavia_no_ocupa: "Todavía no tienes lugar en esta sesión.",
  ya_cancelo: "Ya habías cancelado tu lugar.",
};

export async function cancelSessionRsvpAction(sessionId: string, reason: string) {
  const text = reason.trim();
  if (text.length < 1 || text.length > 280) return { error: errors.motivo };
  const token = await readAccessToken();
  if (!token) return { error: "Inicia sesión para cancelar." };
  const cancelled = await createSupabaseWithAccess(token).rpc("cancel_session_rsvp", {
    p_session_id: sessionId,
    p_reason: text,
  });
  const message = cancelled.error?.message ?? "";
  for (const [code, copy] of Object.entries(errors)) {
    if (message.includes(code)) return { error: copy };
  }
  if (cancelled.error) return { error: "No se pudo cancelar." };
  revalidatePath("/app/sesiones");
  return { ok: true as const };
}