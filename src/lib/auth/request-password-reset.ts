"use server";

import { signupErrorCode } from "@/lib/organismo/signup-back";
import { createSupabaseAnon, usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { recoveryRedirect } from "./recovery-link";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ResetRequestState = { ok: true } | { ok: false; error: string } | null;

function hiddenAbsence(message: string) {
  const known = message.toLowerCase();
  return known.includes("not found") || known.includes("user not");
}

export async function requestPasswordReset(
  _previous: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const email = String(formData.get("correo") ?? "").trim().toLowerCase();
  if (!emailPattern.test(email)) return { ok: false, error: "Escribe un correo válido." };
  if (!usesSupabaseAuth()) return { ok: true };

  const sent = await createSupabaseAnon().auth.resetPasswordForEmail(email, {
    redirectTo: recoveryRedirect(process.env.NEXT_PUBLIC_SITE_URL),
  });
  if (!sent.error || hiddenAbsence(sent.error.message)) return { ok: true };
  if (signupErrorCode(sent.error.message) === "limite") {
    return { ok: false, error: "Espera un momento y pide el enlace otra vez." };
  }
  console.error("[recuperar]", sent.error.message);
  return { ok: false, error: "No se pudo enviar el enlace. Inténtalo de nuevo." };
}
