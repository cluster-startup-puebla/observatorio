import { loadSeccion } from "@/lib/admin/metodologia/detail";
import { saveSection } from "@/lib/admin/metodologia/save-section";
import { redirectTo } from "@/lib/admin/redirect";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

const known = new Set(["rango inválido"]);

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
  const toList = form.get("return_to") === "list";
  const back = toList ? "/admin/metodologia" : `/admin/metodologia/${id}?tab=${tab}`;
  const saved = await saveSection(id, form);
  if (!saved.ok) {
    if (!known.has(saved.reason)) console.error("saveSection", saved.reason);
    const reason = known.has(saved.reason) ? saved.reason : "No se pudo guardar. Intenta de nuevo.";
    const sep = back.includes("?") ? "&" : "?";
    return redirectTo(request, `${back}${sep}error=${encodeURIComponent(reason)}`);
  }
  return redirectTo(request, back);
}
