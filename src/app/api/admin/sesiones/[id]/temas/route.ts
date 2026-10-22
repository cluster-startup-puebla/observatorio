import { adminDb } from "@/lib/admin/admin-db";
import { topicDraft } from "@/lib/admin/sesiones/current";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const back = `/admin/sesiones/${id}?tab=temas`;
  const draft = topicDraft({ title: String(form.get("title") ?? ""), position: Number(form.get("position") ?? 0) });
  if (!draft.ok) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(draft.reason)}`, request.url));
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL(`${back}&error=sin%20sesi%C3%B3n`, request.url));
  const inserted = await db.from("session_topics").insert({ session_id: id, title: draft.title, position: draft.position });
  if (inserted.error) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(inserted.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
