import { listBandeja } from "@/lib/admin/bandeja/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  const params = request.nextUrl.searchParams;
  return Response.json(await listBandeja(params.get("page") ?? undefined, params.get("kind") ?? undefined));
}
