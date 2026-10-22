export function brandStamp(input: { name: string | null; brandColor: string | null; hasLogo: boolean }) {
  if (!input.name || !input.brandColor || !input.hasLogo) return null;
  return new Date().toISOString();
}

export function eventPath(sectorSlug: string, token: string) {
  return `/${sectorSlug}?${token}`;
}
