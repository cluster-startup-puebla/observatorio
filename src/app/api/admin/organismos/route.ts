import { listOrganismos } from "@/lib/admin/organismos/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  const body = await listOrganismos(request.nextUrl.searchParams.get("page") ?? undefined);
  return Response.json(body);
}
