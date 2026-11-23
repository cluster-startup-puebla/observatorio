import { ilikePattern } from "@/lib/admin/ilike-pattern";

export function applyEmpresaSearch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  q: string,
) {
  if (!q) return query;
  const pattern = ilikePattern(q);
  return query.ilike("legal_name", pattern);
}
