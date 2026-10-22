import { loadPase } from "@/lib/admin/pases/detail";
import { removeBy } from "@/lib/admin/remove-row";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadPase(id);
  if (!row) return Response.json({ error: "sin qr" }, { status: 404 });
  return Response.json(row);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const back = `/admin/pases/${id}`;
  if (form.get("accion") !== "eliminar") {
    return NextResponse.redirect(new URL(back, request.url));
  }
  const arrival = await removeBy("arrivals", "profile_id", id);
  if (!arrival.ok && !arrival.reason.includes("0 rows")) {
    return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(arrival.reason)}`, request.url));
  }
  const removed = await removeBy("passes", "profile_id", id);
  const path = removed.ok ? "/admin/pases" : `${back}?error=${encodeURIComponent(removed.reason)}`;
  return NextResponse.redirect(new URL(path, request.url));
}
