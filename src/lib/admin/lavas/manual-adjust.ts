import "server-only";
import { adminDb } from "@/lib/admin/admin-db";
import { LAVA_CODES } from "@/lib/lavas/codes";

export async function manualLavaAdjust(form: FormData) {
  const companyId = String(form.get("company_id") ?? "").trim();
  const note = String(form.get("note") ?? "").trim();
  const amount = Number(form.get("amount"));
  if (!companyId) return { ok: false as const, reason: "Elige una empresa." };
  if (!Number.isInteger(amount) || amount === 0) {
    return { ok: false as const, reason: "El monto debe ser un entero distinto de 0." };
  }
  if (note.length < 1 || note.length > 280) {
    return { ok: false as const, reason: "La nota es obligatoria (1–280)." };
  }
  const db = await adminDb();
  if (!db) return { ok: false as const, reason: "No se pudo registrar." };
  const result = await db.rpc("award_lavas", {
    p_company_id: companyId,
    p_action_code: LAVA_CODES.ajusteManual,
    p_ref_key: crypto.randomUUID(),
    p_origen: "manual",
    p_note: note,
    p_manual_amount: amount,
  });
  if (result.error) {
    console.error("manual lava adjust", result.error.message);
    return { ok: false as const, reason: "No se pudo registrar." };
  }
  return { ok: true as const };
}
