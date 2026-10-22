import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import type { QuotaRow } from "./quotas";

const known = new Set(["cupo_menor_al_minimo", "sesion_no_encontrada", "forbidden"]);

export async function saveSessionQuotas(sessionId: string, rows: QuotaRow[]) {
  const db = await adminDb();
  if (!db) {
    console.error("saveSessionQuotas: sin sesión");
    return { ok: false as const, reason: "No se pudieron guardar los cupos. Intenta de nuevo." };
  }
  const payload = rows.map((row) => ({ sector_id: row.sectorId, capacity: row.capacity }));
  const saved = await db.rpc("set_session_quotas", {
    p_session_id: sessionId,
    p_quotas: payload,
  });
  if (saved.error) {
    const message = saved.error.message ?? "";
    if (message.includes("cupo_menor_al_minimo")) {
      return { ok: false as const, reason: "el total de invitados es menor al cupo mínimo" };
    }
    if (![...known].some((code) => message.includes(code))) console.error("set_session_quotas", saved.error);
    return { ok: false as const, reason: "No se pudieron guardar los cupos. Intenta de nuevo." };
  }
  return { ok: true as const, total: Number(saved.data ?? 0) };
}
