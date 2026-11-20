import "server-only";
import { adminDb } from "@/lib/admin/admin-db";

export async function saveLavaBoost(form: FormData) {
  const multiplier = Number(form.get("multiplier"));
  const flatBonus = Number(form.get("flat_bonus"));
  if (!Number.isFinite(multiplier) || multiplier < 0) {
    return { ok: false as const, reason: "Revisa el multiplicador." };
  }
  if (!Number.isFinite(flatBonus) || flatBonus < 0 || !Number.isInteger(flatBonus)) {
    return { ok: false as const, reason: "El bono debe ser un entero ≥ 0." };
  }
  const db = await adminDb();
  if (!db) return { ok: false as const, reason: "No se pudo guardar." };
  const saved = await db
    .from("lava_boost_config")
    .update({
      multiplier,
      flat_bonus: flatBonus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (saved.error) {
    console.error("save lava boost", saved.error.message);
    return { ok: false as const, reason: "No se pudo guardar." };
  }
  return { ok: true as const };
}
