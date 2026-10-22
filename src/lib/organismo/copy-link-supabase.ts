import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { readSessionAccount } from "@/lib/auth/session-account";
import { sealRef } from "@/lib/ref-token";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";
import { writeInviteLink } from "./invite-link-cookie";

function refSecret() {
  return process.env.REF_SECRET ?? "e2e-ref-secret";
}

export async function copySupabaseEventLink(sectorSlug: string) {
  const account = await readSessionAccount();
  const access = await readAccessToken();
  if (!account || !access) redirect("/login");

  const db = createSupabaseWithAccess(access);
  const profile = await db.from("profiles").select("organization_id").eq("id", account.id).maybeSingle();
  const orgId = profile.data?.organization_id;
  if (!orgId) redirect("/onboarding");

  const org = await db.from("organizations").select("slug").eq("id", orgId).maybeSingle();
  const slug = org.data?.slug;
  if (!slug) redirect("/onboarding");

  const sector = await db.from("sectors").select("id").eq("slug", sectorSlug).maybeSingle();
  if (sector.error || !sector.data) {
    console.error("[organismo] enlace", sector.error?.message ?? "sector");
    redirect(`/${slug}?error=enlace`);
  }

  const inserted = await db.from("link_copies").insert({
    organization_id: orgId,
    sector_id: sector.data.id,
    actor_id: account.id,
  });
  if (inserted.error) {
    console.error("[organismo] enlace", inserted.error.message);
    redirect(`/${slug}?error=enlace`);
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}/${sectorSlug}?${sealRef(orgId, refSecret())}`;
  await writeInviteLink(slug, { url, sector: sectorSlug });
  redirect(`/${slug}?enlace=${encodeURIComponent(url)}&sector=${encodeURIComponent(sectorSlug)}`);
}
