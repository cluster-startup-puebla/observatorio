import { adminDb } from "@/lib/admin/admin-db";
import { loadSector } from "@/lib/admin/sectores/detail";
import { headlineForStore } from "@/lib/admin/sectores/headline";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

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
  const headline = headlineForStore(String(form.get("headline") ?? ""));
  const body = String(form.get("body") ?? "").trim();
  const db = await adminDb();
  const back = `/admin/sectores/${id}?tab=pagina`;
  if (!db) return NextResponse.redirect(new URL(`${back}&error=sin%20sesi%C3%B3n`, request.url));
  const saved = await db.from("sector_pages").upsert({ sector_id: id, headline, body: body || null });
  if (saved.error) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(saved.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
