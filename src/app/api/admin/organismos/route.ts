import { createOrganization } from "@/lib/admin/organismos/mutate";
import { listOrganismos } from "@/lib/admin/organismos/list";
import { redirectTo } from "@/lib/admin/redirect";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  const body = await listOrganismos(request.nextUrl.searchParams.get("page") ?? undefined);
  return Response.json(body);
}

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const form = await request.formData();
  const result = await createOrganization(form);
  if (!result.ok) {
    const params = new URLSearchParams({
      error: result.reason,
      name: String(form.get("name") ?? ""),
      color: String(form.get("brand_color") ?? ""),
    });
    return redirectTo(request, `/admin/organismos?${params}`);
  }
  return redirectTo(request, `/admin/organismos/${result.id}`);
}
