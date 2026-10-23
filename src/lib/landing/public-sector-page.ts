import "server-only";

import { sanitizeSectorBody } from "@/lib/html/sanitize-sector-body";
import { createSupabaseAnon, usesSupabaseAuth } from "@/lib/supabase/auth-session";

export async function publicSectorPage(slug: string) {
  if (!usesSupabaseAuth()) return null;
  try {
    const db = createSupabaseAnon();
    const sector = await db.from("sectors").select("id").eq("slug", slug).maybeSingle();
    if (sector.error || !sector.data) return null;
    const page = await db
      .from("sector_pages")
      .select("headline, body")
      .eq("sector_id", sector.data.id)
      .maybeSingle();
    if (page.error || !page.data) return null;
    const headline = page.data.headline?.trim() ?? "";
    const body = sanitizeSectorBody(page.data.body ?? "");
    if (!headline && !body) return null;
    return { headline, body };
  } catch (error) {
    console.error("sector page", error);
    return null;
  }
}
