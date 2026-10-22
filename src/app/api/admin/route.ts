import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { pageQuery } from "@/lib/admin/page-query";
import { tabQuery } from "@/lib/admin/tab-query";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  const page = pageQuery(request.nextUrl.searchParams.get("page") ?? undefined);
  const tab = tabQuery(request.nextUrl.searchParams.get("tab") ?? undefined, ["ficha"], "ficha");
  return Response.json({ page: page.page, size: page.size, tab });
}
