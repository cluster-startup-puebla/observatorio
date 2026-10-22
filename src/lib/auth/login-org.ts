import "server-only";

import { cookies } from "next/headers";
import {
  createSupabaseWithAccess,
  usesSupabaseAuth,
} from "@/lib/supabase/auth-session";

export async function setOrgSlugCookie(slug: string) {
  const jar = await cookies();
  jar.set("org-slug", slug, { path: "/", httpOnly: true, sameSite: "lax" });
}

export async function orgSlugForUser(accessToken: string, userId: string) {
  if (!usesSupabaseAuth()) return null;
  const profile = await createSupabaseWithAccess(accessToken)
    .from("profiles")
    .select("organization_id")
    .eq("id", userId)
    .maybeSingle();
  const orgId = profile.data?.organization_id;
  if (!orgId) return null;
  const org = await createSupabaseWithAccess(accessToken)
    .from("organizations")
    .select("slug")
    .eq("id", orgId)
    .maybeSingle();
  return typeof org.data?.slug === "string" ? org.data.slug : null;
}
