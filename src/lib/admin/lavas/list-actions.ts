import "server-only";
import { adminDb } from "@/lib/admin/admin-db";

export type LavaActionRow = {
  code: string;
  label: string;
  base_value: string;
  once: string;
  eia_boost: string;
  condition_label: string;
  repeatable_label: string;
  active: string;
  sort_order: string;
};

export async function listLavaActions() {
  const db = await adminDb();
  if (!db) return [] as LavaActionRow[];
  const rows = await db
    .from("lava_actions")
    .select(
      "code, label, base_value, once, eia_boost, condition_label, repeatable_label, active, sort_order",
    )
    .neq("code", "ajuste_manual")
    .order("sort_order");
  if (rows.error) {
    console.error("list lava actions", rows.error.message);
    return [] as LavaActionRow[];
  }
  return (rows.data ?? []).map((row) => ({
    code: row.code,
    label: row.label,
    base_value: String(row.base_value),
    once: row.once ? "Sí" : "No",
    eia_boost: row.eia_boost ? "Sí" : "No",
    condition_label: row.condition_label,
    repeatable_label: row.repeatable_label,
    active: row.active ? "Sí" : "No",
    sort_order: String(row.sort_order),
  }));
}
