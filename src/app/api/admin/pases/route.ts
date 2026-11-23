import { listPases } from "@/lib/admin/pases/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  const params = request.nextUrl.searchParams;
  return Response.json(
    await listPases(params.get("page") ?? undefined, params.get("q") ?? undefined, params.get("sector") ?? undefined),
  );
}
