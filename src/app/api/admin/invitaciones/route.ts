import { listInvitaciones } from "@/lib/admin/invitaciones/list";
import { saveInviteSheet } from "@/lib/admin/invitaciones/save-sheet";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  return Response.json(await listInvitaciones(request.nextUrl.searchParams.get("page") ?? undefined));
}

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const result = await saveInviteSheet(await request.formData());
  const path = result.ok ? "/admin/invitaciones" : `/admin/invitaciones?error=${encodeURIComponent(result.reason)}`;
  return NextResponse.redirect(new URL(path, request.url));
}
