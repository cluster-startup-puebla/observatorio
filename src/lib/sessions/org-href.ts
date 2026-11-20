import { sessionPiecePath } from "@/lib/sessions/public-path";

export function orgHref(orgSlug: string, sessionSlug?: string) {
  if (!sessionSlug) return `/${orgSlug}`;
  return sessionPiecePath(sessionSlug, orgSlug);
}
