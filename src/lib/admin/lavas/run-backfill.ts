import "server-only";
import { adminDb } from "@/lib/admin/admin-db";

export type BackfillCounts = {
  perfil: number;
  evaluacion: number;
  llegada: number;
  consent: number;
  reto: number;
};

export async function runLavaBackfill() {
  const db = await adminDb();
  if (!db) return { ok: false as const, reason: "No se pudo ejecutar el barrido." };
  const result = await db.rpc("backfill_lavas");
  if (result.error) {
    console.error("backfill_lavas", result.error.message);
    return { ok: false as const, reason: "No se pudo ejecutar el barrido." };
  }
  const data = (result.data ?? {}) as Partial<BackfillCounts>;
  return {
    ok: true as const,
    counts: {
      perfil: Number(data.perfil ?? 0),
      evaluacion: Number(data.evaluacion ?? 0),
      llegada: Number(data.llegada ?? 0),
      consent: Number(data.consent ?? 0),
      reto: Number(data.reto ?? 0),
    },
  };
}
