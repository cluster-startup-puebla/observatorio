export const pageSize = 10;

export function pageQuery(raw: string | undefined) {
  const parsed = Number(raw);
  const page = Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
  const from = (page - 1) * pageSize;
  return { page, from, to: from + pageSize - 1, size: pageSize };
}
