import { adminDb } from "@/lib/admin/admin-db";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const form = await request.formData();
  const db = await adminDb();
  const back = "/admin/metodologia/integral";
  if (!db) return NextResponse.redirect(new URL(`${back}?error=sin%20sesi%C3%B3n`, request.url));
  const saved = await db.from("integral_bands").update({
    min_score: Number(form.get("min_score")),
    max_score: Number(form.get("max_score")),
    riesgo: String(form.get("riesgo") ?? ""),
    reto: String(form.get("reto") ?? ""),
  }).eq("level", String(form.get("level") ?? ""));
  if (saved.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(saved.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
