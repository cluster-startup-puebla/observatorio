import { loadCuenta } from "@/lib/admin/cuentas/detail";
import { roleChange } from "@/lib/admin/cuentas/role-change";
import { adminDb } from "@/lib/admin/admin-db";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadCuenta(id);
  if (!row) return Response.json({ error: "no encontrada" }, { status: 404 });
  return Response.json(row);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const next = roleChange({
    role: String(form.get("role") ?? ""),
    organizationId: String(form.get("organization_id") ?? ""),
  });
  const back = `/admin/cuentas/${id}`;
  if (!next.ok) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(next.reason)}`, request.url));
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL(`${back}?error=sin%20sesi%C3%B3n`, request.url));
  const updated = await db.from("profiles").update({ role: next.role, organization_id: next.organizationId }).eq("id", id);
  if (updated.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(updated.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
