import { adminDb } from "@/lib/admin/admin-db";
import { brandStamp } from "@/lib/admin/organismos/brand";
import { loadOrganismo } from "@/lib/admin/organismos/detail";
import { organizationPatch } from "@/lib/admin/organismos/organization-patch";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadOrganismo(id);
  if (!row) return Response.json({ error: "no encontrado" }, { status: 404 });
  return Response.json(row);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const patch = organizationPatch({ name: String(form.get("name") ?? ""), brandColor: String(form.get("brand_color") ?? "") });
  const back = `/admin/organismos/${id}`;
  if (!patch.ok) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(patch.reason)}`, request.url));
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL(`${back}?error=sin%20sesi%C3%B3n`, request.url));
  const logo = await db.from("media_assets").select("id").eq("organization_id", id).eq("purpose", "organization_logo").maybeSingle();
  const stamp = brandStamp({ name: patch.name, brandColor: patch.brand_color, hasLogo: Boolean(logo.data) });
  const updated = await db.from("organizations").update({ name: patch.name, brand_color: patch.brand_color, brand_completed_at: stamp }).eq("id", id);
  if (updated.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(updated.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
