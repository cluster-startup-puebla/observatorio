import { adminDb } from "@/lib/admin/admin-db";
import { redirectTo } from "@/lib/admin/redirect";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const form = await request.formData();
  const db = await adminDb();
  const back = "/admin/metodologia/integral";
  if (!db) {
    console.error("integral POST: sin sesión");
    return redirectTo(request, `${back}?error=${encodeURIComponent("No se pudo guardar. Intenta de nuevo.")}`);
  }
  const saved = await db
    .from("integral_bands")
    .update({
      min_score: Number(form.get("min_score")),
      max_score: Number(form.get("max_score")),
      riesgo: String(form.get("riesgo") ?? ""),
      reto: String(form.get("reto") ?? ""),
    })
    .eq("level", String(form.get("level") ?? ""));
  if (saved.error) {
    console.error("integral_bands", saved.error);
    return redirectTo(request, `${back}?error=${encodeURIComponent("No se pudo guardar. Intenta de nuevo.")}`);
  }
  return redirectTo(request, back);
}
