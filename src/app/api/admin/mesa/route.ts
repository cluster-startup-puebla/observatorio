import { processMesaScan } from "@/lib/admin/mesa/process-scan";
import { mesaHref } from "@/lib/admin/mesa/href";
import { requireMesa } from "@/lib/auth/guards";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";
import { NextResponse, type NextRequest } from "next/server";

export const instant = false;

export async function POST(request: NextRequest) {
  const account = await requireMesa();
  const form = await request.formData();
  const rawCode = String(form.get("codigo") ?? "").trim();
  const token = account ? await readAccessToken() : null;
  if (!account || !token) {
    return NextResponse.redirect(new URL(`${mesaHref}?error=${encodeURIComponent("sin sesión")}`, request.url), 303);
  }
  if (!rawCode) {
    return NextResponse.redirect(new URL(`${mesaHref}?error=${encodeURIComponent("sin lectura")}`, request.url), 303);
  }
  const db = createSupabaseAdmin() ?? createSupabaseWithAccess(token);
  const href = await processMesaScan(db, account, rawCode);
  return NextResponse.redirect(new URL(href, request.url), 303);
}
