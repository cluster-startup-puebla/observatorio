import { adminDb } from "@/lib/admin/admin-db";
import { loadSector } from "@/lib/admin/sectores/detail";
import { headlineForStore } from "@/lib/admin/sectores/headline";
import { sanitizeSectorBody } from "@/lib/html/sanitize-sector-body";
import { redirectTo } from "@/lib/admin/redirect";
import { removeBy } from "@/lib/admin/remove-row";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadSector(id);
  if (!row) return Response.json({ error: "no encontrado" }, { status: 404 });
  return Response.json(row);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const list = "/admin/sectores";
  if (form.get("accion") === "eliminar") {
    const removed = await removeBy("sectors", "id", id);
    const path = removed.ok ? list : `${list}?error=${encodeURIComponent(removed.reason)}`;
    return redirectTo(request, path);
  }
  const headline = headlineForStore(String(form.get("headline") ?? ""));
  const body = sanitizeSectorBody(String(form.get("body") ?? ""));
  const db = await adminDb();
  if (!db) {
    console.error("sectores page: sin sesión");
    return redirectTo(request, `${list}?error=${encodeURIComponent("No se pudo guardar. Intenta de nuevo.")}`);
  }
  const saved = await db.from("sector_pages").upsert({ sector_id: id, headline, body: body || null });
  if (saved.error) {
    console.error("sector_pages upsert", saved.error);
    return redirectTo(request, `${list}?error=${encodeURIComponent("No se pudo guardar. Intenta de nuevo.")}`);
  }
  return redirectTo(request, list);
}
