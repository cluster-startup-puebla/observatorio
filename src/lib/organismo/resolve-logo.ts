import "server-only";

import { readDirectorLogo } from "@/lib/organismo/memory-logo";
import {
  createSupabaseWithAccess,
  readAccessToken,
  usesSupabaseAuth,
} from "@/lib/supabase/auth-session";

export type OrgLogo = {
  src: string;
  bytes?: Uint8Array;
  contentType?: string;
};

export async function resolveOrgLogoSrc(accountId: string) {
  const logo = await resolveOrgLogo(accountId);
  return logo?.src;
}

export async function resolveOrgLogo(accountId: string): Promise<OrgLogo | undefined> {
  if (!usesSupabaseAuth()) return memoryLogo(accountId);
  return remoteLogo(accountId);
}

async function memoryLogo(accountId: string): Promise<OrgLogo | undefined> {
  const logo = await readDirectorLogo(accountId);
  if (!logo) return undefined;
  return {
    src: `/api/organismo/logo?v=${logo.objectPath}`,
    bytes: logo.bytes,
    contentType: logo.contentType,
  };
}

async function remoteLogo(accountId: string): Promise<OrgLogo | undefined> {
  const token = await readAccessToken();
  if (!token) return undefined;
  const db = createSupabaseWithAccess(token);
  const profile = await db.from("profiles").select("organization_id").eq("id", accountId).maybeSingle();
  const orgId = profile.data?.organization_id;
  if (!orgId) return undefined;
  const asset = await db
    .from("media_assets")
    .select("object_path, content_type")
    .eq("organization_id", orgId)
    .eq("purpose", "organization_logo")
    .maybeSingle();
  const objectPath = asset.data?.object_path;
  if (!objectPath) return undefined;
  const signed = await db.storage.from("organization-logos").createSignedUrl(objectPath, 60 * 60);
  if (!signed.data?.signedUrl) return undefined;
  const file = await db.storage.from("organization-logos").download(objectPath);
  const bytes = file.data ? new Uint8Array(await file.data.arrayBuffer()) : undefined;
  return {
    src: signed.data.signedUrl,
    bytes,
    contentType: asset.data?.content_type || file.data?.type || undefined,
  };
}
