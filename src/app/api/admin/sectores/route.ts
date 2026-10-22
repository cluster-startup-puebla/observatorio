import { listSectores } from "@/lib/admin/sectores/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  return Response.json(await listSectores(request.nextUrl.searchParams.get("page") ?? undefined));
}
