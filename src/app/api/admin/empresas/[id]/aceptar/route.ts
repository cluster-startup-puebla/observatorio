import { adminDb } from "@/lib/admin/admin-db";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const back = `/admin/empresas/${id}`;
  const db = await adminDb();
  if (!db) {
    return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent("sin sesión")}`, request.url));
  }
  const approved = await db.rpc("approve_external_signup", { company_id: id });
  if (approved.error) {
    return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(approved.error.message)}`, request.url));
  }
  return NextResponse.redirect(new URL(back, request.url));
}
