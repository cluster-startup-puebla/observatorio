import { adminDb } from "@/lib/admin/admin-db";
import { listSectores } from "@/lib/admin/sectores/list";
import { redirectTo } from "@/lib/admin/redirect";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  return Response.json(await listSectores(request.nextUrl.searchParams.get("page") ?? undefined));
}

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const slug = String(form.get("slug") ?? "").trim().toLowerCase();
  const position = Number(form.get("position") ?? 0);
  if (!name || !slug || position < 1) {
    return redirectTo(request, `/admin/sectores?error=${encodeURIComponent("completa nombre, ruta y orden")}`);
  }
  const db = await adminDb();
  if (!db) {
    console.error("sectores POST: sin sesión");
    return redirectTo(request, `/admin/sectores?error=${encodeURIComponent("No se pudo crear el sector. Intenta de nuevo.")}`);
  }
  const inserted = await db.from("sectors").insert({ name, slug, position }).select("id").single();
  if (inserted.error || !inserted.data) {
    console.error("sectores insert", inserted.error);
    return redirectTo(request, `/admin/sectores?error=${encodeURIComponent("No se pudo crear el sector. Intenta de nuevo.")}`);
  }
  return redirectTo(request, "/admin/sectores");
}
