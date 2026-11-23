import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { listQueryQ } from "@/lib/admin/list-query";
import { pageQuery } from "@/lib/admin/page-query";
import { loadPassListRows } from "@/lib/admin/pases/load-pass-list";
import type { PassListRow } from "@/lib/admin/pases/pass-list-row";

function matchesQ(row: PassListRow, q: string) {
  if (!q) return true;
  const hay = `${row.name} ${row.email} ${row.company}`.toLowerCase();
  return q
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .every((part) => hay.includes(part));
}

export async function listPases(
  rawPage: string | undefined,
  rawQ?: string,
  rawSector?: string,
) {
  const page = pageQuery(rawPage);
  const q = listQueryQ(rawQ);
  const sector = (rawSector ?? "").trim();
  const empty = {
    page: page.page,
    rows: [] as PassListRow[],
    total: 0,
    q,
    sector,
    sectors: [] as { id: string; name: string }[],
  };
  const db = await adminDb();
  if (!db) return empty;

  const [all, sectors] = await Promise.all([
    loadPassListRows(db),
    db.from("sectors").select("id, name").order("position"),
  ]);
  if (sectors.error) throw new Error(sectors.error.message);

  const filtered = all.filter(
    (row) => matchesQ(row, q) && (!sector || row.sector_id === sector),
  );
  return {
    page: page.page,
    total: filtered.length,
    q,
    sector,
    sectors: (sectors.data ?? []).map((row) => ({ id: row.id, name: row.name ?? row.id })),
    rows: filtered.slice(page.from, page.to + 1),
  };
}
