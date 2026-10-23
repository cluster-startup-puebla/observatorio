import { renderSectorBody } from "./render-sector-body";

const emptyTag = /<(p|strong|em|a)\b[^>]*>\s*<\/\1>/gi;

export function sanitizeSectorBody(input: string) {
  const html = stripEmpty(renderSectorBody(input));
  if (!html || !hasUseful(html)) return "";
  return html;
}

function stripEmpty(html: string) {
  let current = html.trim();
  for (let pass = 0; pass < 6; pass += 1) {
    const next = current.replace(emptyTag, "").trim();
    if (next === current) return current;
    current = next;
  }
  return current;
}

function hasUseful(html: string) {
  if (/<img\b/i.test(html)) return true;
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, "").length > 0;
}
