"use server";

import { redirect } from "next/navigation";
import { createSupabaseAnon, usesSupabaseAuth, writeSupabaseSession } from "@/lib/supabase/auth-session";
import { freshPasswordError } from "./password-change";

export type ResetSaveState = { error: string } | null;

const notices = {
  corta: "Usa al menos 8 caracteres.",
  distinta: "Las contraseñas no coinciden.",
  enlace: "El enlace no es válido o ya venció. Pide otro.",
  guardar: "No se pudo guardar la contraseña.",
  base: "Aquí no se puede cambiar la contraseña de una cuenta de prueba.",
};

export async function saveResetPassword(
  _previous: ResetSaveState,
  formData: FormData,
): Promise<ResetSaveState> {
  const invalid = freshPasswordError(String(formData.get("contrasena") ?? ""), String(formData.get("confirmar") ?? ""));
  if (invalid) return { error: notices[invalid] };
  if (!usesSupabaseAuth()) return { error: notices.base };

  const client = createSupabaseAnon();
  const ready = await client.auth.setSession({
    access_token: String(formData.get("access") ?? ""),
    refresh_token: String(formData.get("refresh") ?? ""),
  });
  if (ready.error || !ready.data.session) return { error: notices.enlace };
  const updated = await client.auth.updateUser({ password: String(formData.get("contrasena") ?? "") });
  if (updated.error) return { error: notices.guardar };
  const latest = await client.auth.getSession();
  await writeSupabaseSession(latest.data.session ?? ready.data.session);
  redirect("/");
}
