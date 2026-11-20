import { redirectTo } from "@/lib/admin/redirect";
import { saveLavaAction } from "@/lib/admin/lavas/save-action";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  await requireSuperadmin();
  const { code } = await context.params;
  const form = await request.formData();
  form.set("code", code);
  const result = await saveLavaAction(form);
  if (!result.ok) {
    const params = new URLSearchParams({ error: result.reason, edit: code });
    return redirectTo(request, `/admin/lavas?${params}`);
  }
  return redirectTo(request, "/admin/lavas");
}
