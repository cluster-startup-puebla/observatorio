import { isPublicMediaPurpose } from "@/lib/admin/medios/public-access";
import { mediaBytesResponse } from "@/lib/medios/file-response";
import { downloadContentImage, findContentImage } from "@/lib/medios/content-image";

export const instant = false;

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const asset = await findContentImage(id);
  if (!asset || !isPublicMediaPurpose(asset.purpose)) {
    return new Response(null, { status: 404 });
  }
  const bytes = await downloadContentImage(asset.bucketId, asset.objectPath);
  if (!bytes) return new Response(null, { status: 404 });
  return mediaBytesResponse(bytes, asset.contentType, "public");
}
