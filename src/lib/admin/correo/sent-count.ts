export function sentCount(rows: { kind: string }[]) {
  return rows.filter((row) => row.kind === "open_innovation").length;
}
