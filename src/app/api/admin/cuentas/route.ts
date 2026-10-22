import { createStaff } from "@/lib/admin/cuentas/create-staff";
import { listCuentas } from "@/lib/admin/cuentas/list";
import { redirectTo } from "@/lib/admin/redirect";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  const body = await listCuentas(request.nextUrl.searchParams.get("page") ?? undefined);
  return Response.json(body);
}

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const result = await createStaff(await request.formData());
  const path = result.ok ? "/admin/cuentas" : `/admin/cuentas?error=${encodeURIComponent(result.reason)}`;
  return redirectTo(request, path);
}
