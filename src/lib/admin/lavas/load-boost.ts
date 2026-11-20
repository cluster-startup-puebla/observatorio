import "server-only";
import { adminDb } from "@/lib/admin/admin-db";

export async function loadLavaBoost() {
  const db = await adminDb();
  if (!db) return { multiplier: 1, flatBonus: 0 };
  const row = await db
    .from("lava_boost_config")
    .select("multiplier, flat_bonus")
    .eq("id", 1)
    .maybeSingle();
  if (row.error) {
    console.error("load lava boost", row.error.message);
    return { multiplier: 1, flatBonus: 0 };
  }
  return {
    multiplier: Number(row.data?.multiplier ?? 1),
    flatBonus: Number(row.data?.flat_bonus ?? 0),
  };
}

export async function listLavaCompanies() {
  const db = await adminDb();
  if (!db) return [] as { id: string; label: string }[];
  const rows = await db.from("companies").select("id, legal_name").order("legal_name");
  if (rows.error) {
    console.error("list lava companies", rows.error.message);
    return [];
  }
  return (rows.data ?? []).map((row) => ({
    id: row.id,
    label: row.legal_name || row.id,
  }));
}
