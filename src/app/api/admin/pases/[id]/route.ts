import { loadPase } from "@/lib/admin/pases/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadPase(id);
  if (!row) return Response.json({ error: "sin qr" }, { status: 404 });
  return Response.json(row);
}
