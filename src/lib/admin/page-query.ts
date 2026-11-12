export const pageSize = 20;

export function pageQuery(raw: string | undefined) {
  const parsed = Number(raw);
  const page = Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
  const from = (page - 1) * pageSize;
  return { page, from, to: from + pageSize - 1, size: pageSize };
}

export function pageCount(total: number) {
  if (total < 1) return 1;
  return Math.ceil(total / pageSize);
}
