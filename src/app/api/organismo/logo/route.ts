import { readSessionAccount } from "@/lib/auth/session-account";
import { readDirectorLogo } from "@/lib/organismo/memory-logo";
import {
  createSupabaseWithAccess,
  readAccessToken,
  usesSupabaseAuth,
} from "@/lib/supabase/auth-session";

export const instant = false;

export async function GET() {
  const account = await readSessionAccount();
  if (!account) return new Response(null, { status: 401 });

  if (!usesSupabaseAuth()) {
    const logo = await readDirectorLogo(account.id);
    if (!logo) return new Response(null, { status: 404 });
    return new Response(Uint8Array.from(logo.bytes), {
      headers: {
        "Content-Type": logo.contentType,
        "Cache-Control": "private, no-store",
      },
    });
  }

  const token = await readAccessToken();
  if (!token) return new Response(null, { status: 401 });
  const db = createSupabaseWithAccess(token);
  const profile = await db
    .from("profiles")
    .select("organization_id")
    .eq("id", account.id)
    .maybeSingle();
  const orgId = profile.data?.organization_id;
  if (!orgId) return new Response(null, { status: 404 });
  const asset = await db
    .from("media_assets")
    .select("object_path, content_type")
    .eq("organization_id", orgId)
    .eq("purpose", "organization_logo")
    .maybeSingle();
  if (!asset.data?.object_path) return new Response(null, { status: 404 });
  const file = await db.storage.from("organization-logos").download(asset.data.object_path);
  if (file.error || !file.data) return new Response(null, { status: 404 });
  return new Response(file.data, {
    headers: {
      "Content-Type": asset.data.content_type,
      "Cache-Control": "private, no-store",
    },
  });
}
