import { adminDb } from "@/lib/admin/admin-db";
import { loadMensaje } from "@/lib/admin/bandeja/detail";
import { mailKind } from "@/lib/admin/bandeja/kinds";
import { retryRow } from "@/lib/admin/bandeja/retry";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadMensaje(id);
  if (!row) return Response.json({ error: "no encontrado" }, { status: 404 });
  return Response.json(row);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const current = await loadMensaje(id);
  const back = `/admin/bandeja/${id}`;
  const kind = current ? mailKind(current.kind) : null;
  if (!current || !kind) return NextResponse.redirect(new URL(`${back}?error=no%20encontrado`, request.url));
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL(`${back}?error=sin%20sesi%C3%B3n`, request.url));
  const inserted = await db.from("outbox_messages").insert(retryRow({
    kind,
    to_email: current.to_email,
    profile_id: current.profile_id,
    contact_id: current.contact_id,
  })).select("id").single();
  if (inserted.error || !inserted.data) {
    return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(inserted.error?.message ?? "no se reintentó")}`, request.url));
  }
  return NextResponse.redirect(new URL(`/admin/bandeja/${inserted.data.id}`, request.url));
}
