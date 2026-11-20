export function recoveryRedirect(siteUrl: string | undefined) {
  const site = siteUrl?.trim().replace(/\/$/, "") ?? "";
  if (!/^https?:\/\//.test(site)) return undefined;
  return `${site}/restablecer`;
}

export function recoveryHash(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const access = params.get("access_token") ?? "";
  const refresh = params.get("refresh_token") ?? "";
  if (params.get("type") !== "recovery" || !access || !refresh) return null;
  return { access, refresh };
}

export const recoveryStoreKey = "observatorio-recovery";

export function storedRecovery(raw: string | null) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { access?: unknown; refresh?: unknown };
    if (typeof parsed.access !== "string" || typeof parsed.refresh !== "string") return null;
    if (!parsed.access || !parsed.refresh) return null;
    return { access: parsed.access, refresh: parsed.refresh };
  } catch {
    return null;
  }
}
