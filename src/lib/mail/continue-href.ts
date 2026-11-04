export function continueHref(siteUrl: string | undefined) {
  const base = siteUrl?.trim().replace(/\/$/, "");
  if (!base) return null;
  return `${base}/onboarding`;
}
