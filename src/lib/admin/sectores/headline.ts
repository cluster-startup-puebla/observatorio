export function headlineForStore(raw: string) {
  const text = raw.trim();
  return text.length ? text : null;
}

export function landingMessage(page: { headline: string | null; body: string | null }) {
  const headline = page.headline?.trim() ?? "";
  if (!headline) return null;
  return { headline, body: page.body?.trim() ?? "" };
}
