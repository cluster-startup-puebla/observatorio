import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { sendRsvpPass } from "@/lib/mail/send-rsvp-pass";
import { isUuid } from "@/lib/ref-token";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";
import { NextResponse, type NextRequest } from "next/server";

const back = "/admin/registros";

function phrase(message: string) {
  if (message.includes("sector_lleno")) return "Ese sector o sesión ya llenó su cupo.";
  if (message.includes("incompleto")) return "El registro todavía no está completo.";
  if (message.includes("sesion")) return "El registro no tiene sesión.";
  return "No se pudo confirmar el lugar.";
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
  if (!token || !isUuid(id)) return redirect(request, "error", "No se pudo confirmar el lugar.");
  const db = createSupabaseWithAccess(token);
  const confirmed = await db.rpc("confirm_registration_rsvp", { p_registration_id: id });
  const row = Array.isArray(confirmed.data) ? confirmed.data[0] : confirmed.data;
  if (confirmed.error || !row?.rsvp_id) {
    console.error("confirm_registration_rsvp", confirmed.error?.message);
    return redirect(request, "error", phrase(confirmed.error?.message ?? ""));
  }
  const session = await db.from("sessions").select("title").eq("id", row.session_id).maybeSingle();
  const label = session.data?.title?.trim() || "la sesión";
  const sent = await sendRsvpPass(String(row.to_email), String(row.rsvp_id), label);
  if (!sent.ok) return redirect(request, "error", "El lugar quedó confirmado. El pase no salió.");
  return redirect(request, "ok", "1");
}
