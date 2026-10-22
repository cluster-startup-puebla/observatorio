import { adminDb } from "@/lib/admin/admin-db";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { logoObjectPath } from "@/lib/storage-assets";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const file = form.get("logo");
  const back = `/admin/organismos/${id}?tab=logo`;
  if (!(file instanceof File)) return NextResponse.redirect(new URL(`${back}&error=falta%20el%20archivo`, request.url));
  if (file.size > 2_097_152) return NextResponse.redirect(new URL(`${back}&error=pasa%20de%202%20MB`, request.url));
  let objectPath = "";
  try {
    objectPath = logoObjectPath(id, file.type);
  } catch (error) {
    const message = error instanceof Error ? error.message : "tipo de imagen no permitido";
    return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(message)}`, request.url));
  }
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL(`${back}&error=sin%20sesi%C3%B3n`, request.url));
  const uploaded = await db.storage.from("organization-logos").upload(objectPath, file, { upsert: true, contentType: file.type });
  if (uploaded.error) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(uploaded.error.message)}`, request.url));
  const existing = await db.from("media_assets").select("id").eq("organization_id", id).eq("purpose", "organization_logo").maybeSingle();
  const payload = { object_path: objectPath, content_type: file.type, byte_size: file.size };
  const saved = existing.data
    ? await db.from("media_assets").update(payload).eq("id", existing.data.id)
    : await db.from("media_assets").insert({ ...payload, purpose: "organization_logo", bucket_id: "organization-logos", organization_id: id });
  if (saved.error) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(saved.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
