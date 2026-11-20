import { acceptConsent } from "@/lib/innovation/accept-consent";
import { redirectTo } from "@/lib/admin/redirect";
import { createSupabaseAnon } from "@/lib/supabase/auth-session";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const token = String(form.get("token") ?? "");
  let result: "aceptado" | "invalido" = "invalido";
  try {
    result = await acceptConsent(token);
  } catch (error) {
    console.error("accept_open_innovation", error);
  }
  if (result === "aceptado") {
    const awarded = await createSupabaseAnon().rpc("award_lavas_for_consent", {
      raw_token: token.trim(),
    });
    if (awarded.error) console.error("lavas consent anon", awarded.error.message);
  }
  const path =
    result === "aceptado" ? "/innovacion-abierta/aceptar?listo=1" : "/innovacion-abierta/aceptar?error=1";
  return redirectTo(request, path);
}
