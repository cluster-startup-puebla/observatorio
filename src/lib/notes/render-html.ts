import { marked } from "marked";

const IMG = /<img\b[^>]*>/gi;

function escapeAttr(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function decodeAttr(value: string) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

function quotedAttr(tag: string, name: string) {
  const match = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i").exec(tag);
  if (!match) return "";
  return decodeAttr(match[1] ?? match[2] ?? "");
}

function safeImageSrc(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.protocol === "https:") return url.toString();
  } catch {
    return null;
  }
  return null;
}

function scrubImage(tag: string) {
  const src = safeImageSrc(quotedAttr(tag, "src"));
  const alt = escapeAttr(quotedAttr(tag, "alt"));
  if (!src) return alt;
  return `<img src="${escapeAttr(src)}" alt="${alt}" />`;
}

export function renderNoteHtml(markdown: string) {
  const html = marked.parse(markdown, { async: false }) as string;
  return html.replace(IMG, scrubImage);
}
