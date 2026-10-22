import { adminDb } from "@/lib/admin/admin-db";
import { innovationDetail } from "@/lib/admin/correo/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const db = await adminDb();
  if (!db) return Response.json({ error: "sin sesión" }, { status: 401 });
  const row = await db.from("outbox_messages").select("id, kind, subject, to_email, created_at").eq("id", id).maybeSingle();
  if (row.error) return Response.json({ error: row.error.message }, { status: 500 });
  const detail = innovationDetail(row.data);
  if (!detail) return Response.json({ error: "no es innovación abierta" }, { status: 404 });
  return Response.json({ ...detail, id, created_at: row.data?.created_at });
}
