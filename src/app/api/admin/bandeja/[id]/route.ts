import { loadMensaje } from "@/lib/admin/bandeja/detail";
import { mailKind } from "@/lib/admin/bandeja/kinds";
import { retryRow } from "@/lib/admin/bandeja/retry";
import { adminDb } from "@/lib/admin/admin-db";
import { redirectTo } from "@/lib/admin/redirect";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

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
  const list = "/admin/bandeja";
  const kind = current ? mailKind(current.kind) : null;
  if (!current || !kind) {
    return redirectTo(request, `${list}?error=${encodeURIComponent("mensaje no encontrado")}`);
  }
  if (current.sent_at) {
    return redirectTo(request, `${list}?error=${encodeURIComponent("Ese correo ya se envió.")}`);
  }
  const db = await adminDb();
  if (!db) {
    console.error("bandeja retry: sin sesión");
    return redirectTo(request, `${list}?error=${encodeURIComponent("No se pudo reintentar. Intenta de nuevo.")}`);
  }
  const inserted = await db
    .from("outbox_messages")
    .insert(
      retryRow({
        kind,
        to_email: current.to_email,
        profile_id: current.profile_id,
        contact_id: current.contact_id,
      }),
    )
    .select("id")
    .single();
  if (inserted.error || !inserted.data) {
    console.error("bandeja retry", inserted.error);
    return redirectTo(request, `${list}?error=${encodeURIComponent("No se pudo reintentar. Intenta de nuevo.")}`);
  }
  return redirectTo(request, list);
}
