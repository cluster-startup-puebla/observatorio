import "server-only";

import { readDirectorLogo } from "@/lib/organismo/memory-logo";
import {
  createSupabaseWithAccess,
  readAccessToken,
  usesSupabaseAuth,
} from "@/lib/supabase/auth-session";

export async function resolveOrgLogoSrc(accountId: string): Promise<string | undefined> {
  if (!usesSupabaseAuth()) {
    const logo = await readDirectorLogo(accountId);
    return logo ? `/api/organismo/logo?v=${logo.objectPath}` : undefined;
  }
  const token = await readAccessToken();
  if (!token) return undefined;
  const db = createSupabaseWithAccess(token);
  const profile = await db
    .from("profiles")
    .select("organization_id")
    .eq("id", accountId)
    .maybeSingle();
  const orgId = profile.data?.organization_id;
  if (!orgId) return undefined;
  const asset = await db
    .from("media_assets")
    .select("object_path")
    .eq("organization_id", orgId)
    .eq("purpose", "organization_logo")
    .maybeSingle();
  if (!asset.data?.object_path) return undefined;
  const signed = await db.storage
    .from("organization-logos")
    .createSignedUrl(asset.data.object_path, 60 * 60);
  return signed.data?.signedUrl ?? undefined;
}
