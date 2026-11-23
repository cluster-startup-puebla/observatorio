import { redirectTo } from "@/lib/admin/redirect";
import { createSession } from "@/lib/admin/sesiones/create-session";
import { listSesiones } from "@/lib/admin/sesiones/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  return Response.json(await listSesiones(request.nextUrl.searchParams.get("page") ?? undefined));
}

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const form = await request.formData();
  const list = "/admin/sesiones";
  const created = await createSession(form);
  if (!created.ok) return redirectTo(request, `${list}?error=${encodeURIComponent(created.reason)}`);
  return redirectTo(request, list);
}
