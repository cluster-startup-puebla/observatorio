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
