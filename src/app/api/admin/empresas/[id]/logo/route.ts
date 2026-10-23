import { adminDb } from "@/lib/admin/admin-db";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const db = await adminDb();
  if (!db) return new Response(null, { status: 404 });
  const company = await db.from("companies").select("profile_id, show_logo_on_event").eq("id", id).maybeSingle();
  if (!company.data?.show_logo_on_event) return new Response(null, { status: 404 });
  const asset = await db
    .from("media_assets")
    .select("object_path, content_type")
    .eq("profile_id", company.data.profile_id)
    .eq("purpose", "company_logo")
    .maybeSingle();
  if (!asset.data?.object_path) return new Response(null, { status: 404 });
  const file = await db.storage.from("company-logos").download(asset.data.object_path);
  if (file.error || !file.data) return new Response(null, { status: 404 });
  return new Response(file.data, {
    headers: { "Content-Type": asset.data.content_type, "Cache-Control": "private, no-store" },
  });
}
