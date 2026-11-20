import { redirectTo } from "@/lib/admin/redirect";
import { manualLavaAdjust } from "@/lib/admin/lavas/manual-adjust";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const form = await request.formData();
  const result = await manualLavaAdjust(form);
  if (!result.ok) {
    return redirectTo(request, `/admin/lavas?error=${encodeURIComponent(result.reason)}&panel=manual`);
  }
  return redirectTo(request, "/admin/lavas?ok=manual");
}
