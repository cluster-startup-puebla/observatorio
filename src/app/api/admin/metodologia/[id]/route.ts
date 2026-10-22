import { loadSeccion } from "@/lib/admin/metodologia/detail";
import { saveSection } from "@/lib/admin/metodologia/save-section";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadSeccion(id);
  if (!row) return Response.json({ error: "no encontrada" }, { status: 404 });
  return Response.json(row);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const tab = String(form.get("tab") ?? "preguntas");
  const back = `/admin/metodologia/${id}?tab=${tab}`;
  const saved = await saveSection(id, form);
  if (!saved.ok) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(saved.reason)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
