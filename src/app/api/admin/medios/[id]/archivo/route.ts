import { readAdminMediaFile } from "@/lib/admin/medios/read-file";
import { mediaBytesResponse } from "@/lib/medios/file-response";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const file = await readAdminMediaFile(id);
  if (!file) return new Response(null, { status: 404 });
  return mediaBytesResponse(file.bytes, file.contentType, "private");
}
