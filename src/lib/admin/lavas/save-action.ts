import "server-only";
import { adminDb } from "@/lib/admin/admin-db";

export async function saveLavaAction(form: FormData) {
  const code = String(form.get("code") ?? "").trim();
  const label = String(form.get("label") ?? "").trim();
  const condition = String(form.get("condition_label") ?? "").trim();
  const repeatable = String(form.get("repeatable_label") ?? "").trim();
  const base = Number(form.get("base_value"));
  const sort = Number(form.get("sort_order"));
  if (!code || label.length < 2 || condition.length < 2 || repeatable.length < 2) {
    return { ok: false as const, reason: "Revisa los textos del catálogo." };
  }
  if (!Number.isFinite(base) || base < 0 || !Number.isFinite(sort) || sort <= 0) {
    return { ok: false as const, reason: "Revisa el valor base o el orden." };
  }
  const db = await adminDb();
  if (!db) return { ok: false as const, reason: "No se pudo guardar." };
  const saved = await db
    .from("lava_actions")
    .update({
      label,
      base_value: Math.trunc(base),
      once: form.get("once") === "on",
      eia_boost: form.get("eia_boost") === "on",
      condition_label: condition,
      repeatable_label: repeatable,
      active: form.get("active") === "on",
      sort_order: Math.trunc(sort),
      updated_at: new Date().toISOString(),
    })
    .eq("code", code)
    .neq("code", "ajuste_manual");
  if (saved.error) {
    console.error("save lava action", saved.error.message);
    return { ok: false as const, reason: "No se pudo guardar." };
  }
  return { ok: true as const };
}
