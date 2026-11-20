import { sessionPiecePath } from "@/lib/sessions/public-path";

type Query = Record<string, string | string[] | undefined>;

export function legacyPieceHref(publicSlug: string, piece: string, suffix = "", query?: Query) {
  const base = suffix ? `${sessionPiecePath(publicSlug, piece)}/${suffix}` : sessionPiecePath(publicSlug, piece);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (typeof value === "string") params.set(key, value);
  }
  const search = params.toString();
  return search ? `${base}?${search}` : base;
}
