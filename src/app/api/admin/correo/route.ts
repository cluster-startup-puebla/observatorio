import { mailKind } from "@/lib/admin/bandeja/kinds";
import { adminDb } from "@/lib/admin/admin-db";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { isBroadcastKind } from "@/lib/mail/broadcast-audience";
import { sendBroadcast } from "@/lib/mail/send-broadcast";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const db = await adminDb();
  const form = await request.formData();
  const kind = mailKind(String(form.get("kind") ?? "open_innovation"));
  const sessionId = String(form.get("session_id") ?? "") || null;
  if (!db || !kind || !isBroadcastKind(kind)) {
    return NextResponse.redirect(new URL("/admin/correo?error=sin%20sesi%C3%B3n", request.url));
  }
  const result = await sendBroadcast(db, { kind, sessionId });
  const problem = result.error ?? result.warning;
  if (problem) {
    return NextResponse.redirect(new URL(`/admin/correo?error=${encodeURIComponent(problem)}`, request.url));
  }
  return NextResponse.redirect(new URL(`/admin/correo?enviado=1&n=${result.sent}`, request.url));
}
