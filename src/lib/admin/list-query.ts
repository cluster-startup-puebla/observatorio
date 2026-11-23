export function listQueryQ(raw: string | undefined) {
  return (raw ?? "")
    .trim()
    .replace(/,/g, " ")
    .replace(/\s+/g, " ");
}

export function listHref(input: {
  basePath: string;
  page?: number;
  q?: string;
  extras?: Record<string, string | undefined>;
}) {
  const params = new URLSearchParams();
  const q = listQueryQ(input.q);
  if (q) params.set("q", q);
  for (const [key, value] of Object.entries(input.extras ?? {})) {
    const next = (value ?? "").trim();
    if (next) params.set(key, next);
  }
  if (input.page && input.page > 1) params.set("page", String(input.page));
  const query = params.toString();
  return query ? `${input.basePath}?${query}` : input.basePath;
}
