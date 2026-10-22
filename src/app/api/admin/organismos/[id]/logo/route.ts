import { adminDb } from "@/lib/admin/admin-db";
import { memoryReadLogo, memoryLoadOrganismo, memoryUpdateOrganismo } from "@/lib/admin/organismos/memory";
import { readLogoFile } from "@/lib/admin/organismos/logo-file";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { logoObjectPath } from "@/lib/storage-assets";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const file = form.get("logo");
  const back = `/admin/organismos/${id}?tab=logo`;
  if (!usesSupabaseAuth()) {
    const parsed = await readLogoFile(file);
    const current = memoryLoadOrganismo(id);
    if (!parsed || "error" in parsed || !current?.org.name || !current.org.brand_color) {
      const reason = !parsed ? "falta el archivo" : "error" in parsed ? parsed.error : "no encontrado";
      return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(reason)}`, request.url), 303);
    }
    memoryUpdateOrganismo(id, current.org.name, current.org.brand_color, parsed);
    return NextResponse.redirect(new URL(back, request.url), 303);
  }
  if (!(file instanceof File)) return NextResponse.redirect(new URL(`${back}&error=falta%20el%20archivo`, request.url), 303);
  if (file.size > 2_097_152) return NextResponse.redirect(new URL(`${back}&error=pasa%20de%202%20MB`, request.url), 303);
  let objectPath = "";
  try {
    objectPath = logoObjectPath(id, file.type);
  } catch (error) {
    const message = error instanceof Error ? error.message : "tipo de imagen no permitido";
    return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(message)}`, request.url), 303);
  }
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL(`${back}&error=sin%20sesi%C3%B3n`, request.url), 303);
  const uploaded = await db.storage.from("organization-logos").upload(objectPath, file, { upsert: true, contentType: file.type });
  if (uploaded.error) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(uploaded.error.message)}`, request.url), 303);
  const existing = await db.from("media_assets").select("id").eq("organization_id", id).eq("purpose", "organization_logo").maybeSingle();
  const payload = { object_path: objectPath, content_type: file.type, byte_size: file.size };
  const saved = existing.data
    ? await db.from("media_assets").update(payload).eq("id", existing.data.id)
    : await db.from("media_assets").insert({ ...payload, purpose: "organization_logo", bucket_id: "organization-logos", organization_id: id });
  if (saved.error) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(saved.error.message)}`, request.url), 303);
  return NextResponse.redirect(new URL(back, request.url), 303);
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  if (!usesSupabaseAuth()) {
    const logo = memoryReadLogo(id);
    if (!logo) return new Response(null, { status: 404 });
    return new Response(Buffer.from(logo.bytes), {
      headers: { "Content-Type": logo.contentType, "Cache-Control": "private, no-cache" },
    });
  }
  const db = await adminDb();
  if (!db) return new Response(null, { status: 401 });
  const asset = await db
    .from("media_assets")
    .select("object_path, content_type")
    .eq("organization_id", id)
    .eq("purpose", "organization_logo")
    .maybeSingle();
  if (asset.error || !asset.data) return new Response(null, { status: 404 });
  const file = await db.storage.from("organization-logos").download(asset.data.object_path);
  if (file.error || !file.data) return new Response(null, { status: 404 });
  return new Response(file.data, {
    headers: {
      "Content-Type": asset.data.content_type,
      "Cache-Control": "private, no-cache",
    },
  });
}
