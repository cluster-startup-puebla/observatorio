import { adminDb } from "@/lib/admin/admin-db";
import { loadMedio } from "@/lib/admin/medios/detail";
import { mediaByteLimit, mediaTarget } from "@/lib/admin/medios/target";
import { redirectTo } from "@/lib/admin/redirect";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

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
  const list = "/admin/medios";
  const current = await loadMedio(id);
  if (!current || !(file instanceof File) || file.size === 0) {
    return redirectTo(request, `${list}?error=${encodeURIComponent("falta el archivo")}`);
  }
  const purpose = current.purpose as "organization_logo" | "pass_qr" | "content_image";
  if (file.size > mediaByteLimit(purpose)) {
    return redirectTo(request, `${list}?error=${encodeURIComponent("el archivo es demasiado grande")}`);
  }
  const target = mediaTarget({
    purpose,
    organizationId: current.organization_id ?? undefined,
    profileId: current.profile_id ?? undefined,
    slug: current.content_block_slug ?? undefined,
    filename: String(form.get("filename") ?? ""),
    contentType: file.type,
  });
  const db = await adminDb();
  if (!db) {
    console.error("medios POST: sin sesión");
    return redirectTo(request, `${list}?error=${encodeURIComponent("No se pudo reemplazar. Intenta de nuevo.")}`);
  }
  const uploaded = await db.storage.from(target.bucket).upload(target.path, file, { upsert: true, contentType: file.type });
  if (uploaded.error) {
    console.error("medios upload", uploaded.error);
    return redirectTo(request, `${list}?error=${encodeURIComponent("No se pudo reemplazar. Intenta de nuevo.")}`);
  }
  const saved = await db
    .from("media_assets")
    .update({ object_path: target.path, content_type: file.type, byte_size: file.size })
    .eq("id", id);
  if (saved.error) {
    console.error("medios update", saved.error);
    return redirectTo(request, `${list}?error=${encodeURIComponent("No se pudo reemplazar. Intenta de nuevo.")}`);
  }
  return redirectTo(request, list);
}
