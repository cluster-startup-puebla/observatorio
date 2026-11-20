import "server-only";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";

export type LavaCatalogRow = {
  code: string;
  label: string;
  base_value: number;
  once: boolean;
  eia_boost: boolean;
  condition_label: string;
  repeatable_label: string;
};

export async function loadLavaCatalog(accessToken: string) {
  const db = createSupabaseWithAccess(accessToken);
  const rows = await db
    .from("lava_actions")
    .select("code, label, base_value, once, eia_boost, condition_label, repeatable_label")
    .eq("active", true)
    .neq("code", "ajuste_manual")
    .order("sort_order");
  if (rows.error) {
    console.error("lava catalog", rows.error.message);
    return [] as LavaCatalogRow[];
  }
  return (rows.data ?? []) as LavaCatalogRow[];
}
