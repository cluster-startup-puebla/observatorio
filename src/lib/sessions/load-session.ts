import "server-only";

import { cache } from "react";
import { createSupabaseAnon } from "@/lib/supabase/auth-session";

export type PublicSession = {
  publicSlug: string;
};

export const sessionBySlug = cache(async function sessionBySlug(
  publicSlug: string,
): Promise<PublicSession | null> {
  const result = await createSupabaseAnon()
    .from("sessions")
    .select("public_slug")
    .eq("public_slug", publicSlug)
    .maybeSingle();
  if (result.error) throw new Error(result.error.message);
  const slug = result.data?.public_slug;
  if (typeof slug !== "string" || slug.length === 0) return null;
  return { publicSlug: slug };
});
