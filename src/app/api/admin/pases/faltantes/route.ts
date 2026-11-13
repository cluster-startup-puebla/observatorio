import { repairMissingPasses } from "@/lib/admin/pases/repair";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { readAccessToken } from "@/lib/supabase/auth-session";
import { NextResponse, type NextRequest } from "next/server";

const failed = "/admin/pases?error=No%20se%20pudieron%20generar%20los%20pases.";

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const token = await readAccessToken();
  if (!token) return NextResponse.redirect(new URL(failed, request.url), 303);
  const repaired = await repairMissingPasses(token);
  const path = repaired.ok ? `/admin/pases?ok=${repaired.written}` : failed;
  return NextResponse.redirect(new URL(path, request.url), 303);
}
