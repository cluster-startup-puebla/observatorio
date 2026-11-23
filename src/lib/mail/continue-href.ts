const publishedSite = "https://observatorio.clusterdestartups.org";

export function mailOrigin(siteUrl: string | undefined) {
  const base = siteUrl?.trim().replace(/\/$/, "");
  return base || publishedSite;
}

export function continueHref(siteUrl: string | undefined) {
  return `${mailOrigin(siteUrl)}/login`;
}

export function accountHref(siteUrl: string | undefined, email: string) {
  const mail = email.trim().toLowerCase();
  const query = mail ? `?correo=${encodeURIComponent(mail)}` : "";
  return `${mailOrigin(siteUrl)}/crear-cuenta${query}`;
}
