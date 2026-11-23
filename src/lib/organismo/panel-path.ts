/** True when the path is the org panel under /{slug} or /sesiones/.../{slug}. */
export function isOrgPanelPath(path: string, orgSlug: string) {
  if (!orgSlug) return false;
  if (path === `/${orgSlug}` || path.startsWith(`/${orgSlug}/`)) return true;
  const parts = path.split("/").filter(Boolean);
  return parts[0] === "sesiones" && parts.length >= 2 && parts[2] === orgSlug;
}
