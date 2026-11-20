import { redirectTo } from "@/lib/admin/redirect";
import { saveLavaBoost } from "@/lib/admin/lavas/save-boost";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const form = await request.formData();
  const result = await saveLavaBoost(form);
  if (!result.ok) {
    return redirectTo(request, `/admin/lavas?error=${encodeURIComponent(result.reason)}&panel=boost`);
  }
  return redirectTo(request, "/admin/lavas?ok=boost");
}
