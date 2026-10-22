import { adminDb } from "@/lib/admin/admin-db";
import { loadMedio } from "@/lib/admin/medios/detail";
import { mediaByteLimit, mediaTarget } from "@/lib/admin/medios/target";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadMedio(id);
  if (!row) return Response.json({ error: "no encontrado" }, { status: 404 });
  return Response.json(row);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const file = form.get("archivo");
  const back = `/admin/medios/${id}`;
  const current = await loadMedio(id);
  if (!current || !(file instanceof File)) return NextResponse.redirect(new URL(`${back}?error=falta%20el%20archivo`, request.url));
  const purpose = current.purpose as "organization_logo" | "pass_qr" | "content_image";
  if (file.size > mediaByteLimit(purpose)) return NextResponse.redirect(new URL(`${back}?error=archivo%20grande`, request.url));
  const target = mediaTarget({
    purpose,
    organizationId: current.organization_id ?? undefined,
    profileId: current.profile_id ?? undefined,
    slug: current.content_block_slug ?? undefined,
    filename: String(form.get("filename") ?? ""),
    contentType: file.type,
  });
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL(`${back}?error=sin%20sesi%C3%B3n`, request.url));
  const uploaded = await db.storage.from(target.bucket).upload(target.path, file, { upsert: true, contentType: file.type });
  if (uploaded.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(uploaded.error.message)}`, request.url));
  const saved = await db.from("media_assets").update({ object_path: target.path, content_type: file.type, byte_size: file.size }).eq("id", id);
  if (saved.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(saved.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
