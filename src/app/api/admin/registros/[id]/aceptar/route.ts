import { temporaryPassword } from "@/lib/admin/registros/temp-password";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { sendPublicPass } from "@/lib/mail/send-public-pass";
import { isUuid, openRef } from "@/lib/ref-token";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";
import { NextResponse, type NextRequest } from "next/server";

const back = "/admin/registros";

function phrase(message: string) {
  if (message.includes("sector_lleno")) return "Ese sector ya llenó su cupo.";
  if (message.includes("incompleto")) return "El registro todavía no está completo.";
  if (message.includes("ya tiene cuenta")) return "Ese correo ya tiene empresa. Acéptalo desde Empresas.";
  return "No se pudo aceptar.";
}

function redirect(request: NextRequest, key: "error" | "ok", value: string) {
  const url = new URL(back, request.url);
  url.searchParams.set(key, value);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const token = await readAccessToken();
  if (!token || !isUuid(id)) return redirect(request, "error", "No se pudo aceptar.");
  const db = createSupabaseWithAccess(token);
  const found = await db.from("public_registrations").select("invite_token").eq("id", id).maybeSingle();
  if (found.error || !found.data) return redirect(request, "error", "No se pudo aceptar.");
  const secret = process.env.REF_SECRET ?? "e2e-ref-secret";
  const opened = found.data.invite_token ? openRef(found.data.invite_token, secret) : null;
  const orgId = opened && isUuid(opened) ? opened : null;
  const accepted = await db.rpc("accept_public_registration", {
    registration_id: id,
    account_password: temporaryPassword,
    org_id: orgId,
  });
  const acceptedRow = Array.isArray(accepted.data) ? accepted.data[0] : accepted.data;
  const profileId = acceptedRow?.guest_id;
  if (accepted.error || !profileId) {
    console.error("accept_public_registration", accepted.error?.message ?? "sin perfil");
    return redirect(request, "error", phrase(accepted.error?.message ?? ""));
  }
  const sent = await sendPublicPass(token, profileId);
  if (!sent.ok) return redirect(request, "error", "La cuenta quedó lista. El pase no salió.");
  return redirect(request, "ok", "1");
}
