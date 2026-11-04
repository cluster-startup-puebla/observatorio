"use server";

import { resendSignupConfirmation } from "./resend-confirmation";

export type ResendState = { sent: boolean; error: string };

const messages: Record<string, string> = {
  correo: "Escribe un correo válido.",
  limite: "Hay demasiados intentos. Espera un momento e inténtalo de nuevo.",
};

export async function resendConfirmationAction(_prev: ResendState, formData: FormData): Promise<ResendState> {
  const result = await resendSignupConfirmation(String(formData.get("correo") ?? ""));
  if (result === "ok") return { sent: true, error: "" };
  return { sent: false, error: messages[result] };
}
