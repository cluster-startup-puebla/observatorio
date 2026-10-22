import { loadOrganismo } from "@/lib/admin/organismos/detail";
import { removeOrganization, updateOrganization } from "@/lib/admin/organismos/mutate";
import { redirectTo } from "@/lib/admin/redirect";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadOrganismo(id);
  if (!row) return Response.json({ error: "no encontrado" }, { status: 404 });
  return Response.json(row);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const back = `/admin/organismos/${id}`;
  if (form.get("accion") === "eliminar") {
    const removed = await removeOrganization(id);
    const path = removed.ok ? "/admin/organismos" : `${back}?error=${encodeURIComponent(removed.reason)}`;
    return redirectTo(request, path);
  }
  const updated = await updateOrganization(id, form);
  if (!updated.ok) {
    const params = new URLSearchParams({
      error: updated.reason,
      edit: id,
      name: String(form.get("name") ?? ""),
      color: String(form.get("brand_color") ?? ""),
    });
    return redirectTo(request, `/admin/organismos?${params}`);
  }
  return redirectTo(request, back);
}
