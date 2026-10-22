import { loadEmpresa } from "@/lib/admin/empresas/detail";
import { companyDraft } from "@/lib/admin/empresas/draft";
import { adminDb } from "@/lib/admin/admin-db";
import { removeBy } from "@/lib/admin/remove-row";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadEmpresa(id);
  if (!row) return Response.json({ error: "no encontrada" }, { status: 404 });
  return Response.json(row);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const back = `/admin/empresas/${id}`;
  if (form.get("accion") === "eliminar") {
    const removed = await removeBy("companies", "id", id);
    const path = removed.ok ? "/admin/empresas" : `${back}?error=${encodeURIComponent(removed.reason)}`;
    return NextResponse.redirect(new URL(path, request.url));
  }
  const current = await loadEmpresa(id);
  if (!current) return NextResponse.redirect(new URL(`${back}?error=no%20encontrada`, request.url));
  const draft = companyDraft({
    legalName: String(form.get("legal_name") ?? ""),
    sectorId: String(form.get("sector_id") ?? ""),
    band: String(form.get("employee_band") ?? ""),
    referral: String(form.get("referral_source") ?? ""),
    profileId: current.company.profile_id,
    sectorSource: String(form.get("sector_source") ?? ""),
  });
  if (!draft.ok) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(draft.reason)}`, request.url));
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL(`${back}?error=sin%20sesi%C3%B3n`, request.url));
  const updated = await db.from("companies").update({
    legal_name: draft.legal_name,
    sector_id: draft.sector_id,
    employee_band: draft.employee_band,
    referral_source: draft.referral_source,
    sector_source: draft.sector_source,
  }).eq("id", id);
  if (updated.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(updated.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
