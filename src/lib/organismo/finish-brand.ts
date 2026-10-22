import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readLogoFile } from "@/lib/admin/organismos/logo-file";
import { logoObjectPath } from "@/lib/storage-assets";
import { sectors } from "@/lib/sectors";
import {
  createSupabaseWithAccess,
  readAccessToken,
} from "@/lib/supabase/auth-session";
import { clearOrgIntent } from "./signup-intent";
import { orgSlug, slugError } from "./slug";

export async function finishOrganismoBrand(formData: FormData) {
  const name = String(formData.get("nombre") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();
  const logo = await readLogoFile(formData.get("logo"));
  if (!logo || "error" in logo) redirect("/onboarding?error=logo");
  if (name.length < 2 || !color) redirect("/onboarding?error=marca");

  const slug = orgSlug(name, "");
  if (slugError(slug, sectors.map((s) => s.slug))) redirect("/onboarding?error=slug");

  const token = await readAccessToken();
  if (!token) redirect("/login?next=/onboarding");

  const orgId = crypto.randomUUID();
  const logoPath = logoObjectPath(orgId, logo.contentType);
  const db = createSupabaseWithAccess(token);

  const finished = await db.rpc("finish_organization_brand", {
    org_id: orgId,
    org_name: name,
    org_slug: slug,
    org_color: color,
    logo_path: logoPath,
    logo_type: logo.contentType,
    logo_bytes: logo.bytes.byteLength,
  });
  if (finished.error) {
    console.error("[organismo] marca", finished.error.message);
    const text = finished.error.message.toLowerCase();
    if (text.includes("enlace") || text.includes("sector")) redirect("/onboarding?error=slug");
    redirect("/onboarding?error=marca");
  }

  const uploaded = await db.storage.from("organization-logos").upload(logoPath, logo.bytes, {
    upsert: true,
    contentType: logo.contentType,
  });
  if (uploaded.error) console.error("[organismo] logo", uploaded.error.message);

  const jar = await cookies();
  jar.set("org-slug", slug, { path: "/", httpOnly: true, sameSite: "lax" });
  await clearOrgIntent();
  redirect(`/${slug}`);
}
