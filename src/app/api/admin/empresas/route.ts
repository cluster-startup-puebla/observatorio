import { companyDraft } from "@/lib/admin/empresas/draft";
import { listEmpresas } from "@/lib/admin/empresas/list";
import { adminDb } from "@/lib/admin/admin-db";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  return Response.json(await listEmpresas(request.nextUrl.searchParams.get("page") ?? undefined));
}

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const form = await request.formData();
  const draft = companyDraft({
    legalName: String(form.get("legal_name") ?? ""),
    sectorId: String(form.get("sector_id") ?? ""),
    band: String(form.get("employee_band") ?? ""),
    referral: String(form.get("referral_source") ?? ""),
    profileId: String(form.get("profile_id") ?? ""),
    sectorSource: String(form.get("sector_source") ?? ""),
  });
  if (!draft.ok) return NextResponse.redirect(new URL(`/admin/empresas?error=${encodeURIComponent(draft.reason)}`, request.url));
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL("/admin/empresas?error=sin%20sesi%C3%B3n", request.url));
  const inserted = await db.from("companies").insert({
    legal_name: draft.legal_name,
    sector_id: draft.sector_id,
    employee_band: draft.employee_band,
    referral_source: draft.referral_source,
    profile_id: draft.profile_id,
    sector_source: draft.sector_source,
  }).select("id").single();
  if (inserted.error || !inserted.data) {
    const reason = inserted.error?.message ?? "no se creó";
    return NextResponse.redirect(new URL(`/admin/empresas?error=${encodeURIComponent(reason)}`, request.url));
  }
  return NextResponse.redirect(new URL(`/admin/empresas/${inserted.data.id}`, request.url));
}
