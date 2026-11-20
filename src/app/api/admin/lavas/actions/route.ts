import { listLavaActions } from "@/lib/admin/lavas/list-actions";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export async function GET() {
  await requireSuperadmin();
  return Response.json({ rows: await listLavaActions() });
}
