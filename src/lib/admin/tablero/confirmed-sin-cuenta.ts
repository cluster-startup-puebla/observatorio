export function confirmedSinCuenta(rows: { status?: string | null; profile_id?: string | null }[]) {
  return rows.filter(
    (row) => String(row.status ?? "").toLowerCase() === "confirmed" && !row.profile_id,
  ).length;
}