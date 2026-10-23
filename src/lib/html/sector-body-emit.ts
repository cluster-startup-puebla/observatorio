import { attrValue } from "./html-attrs";
import { readTag, type HtmlTag } from "./html-tag";
import { escapeAttr, safeAlt, safeHref, safeMediaSrc } from "./sector-body-rules";

const kept = new Set(["p", "strong", "em"]);

type Render = (input: string, cursor: { i: number }, stop: string | null) => string;

export function emitTag(input: string, cursor: { i: number }, tag: HtmlTag, render: Render) {
  if (tag.name === "br") return "<br>";
  if (tag.name === "img") return imageTag(tag.rawAttrs);
  const inner = tag.selfClose ? "" : render(input, cursor, tag.name);
  if (tag.name === "a") {
    const href = safeHref(attrValue(tag.rawAttrs, "href") ?? "");
    return href ? `<a href="${escapeAttr(href)}">${inner}</a>` : inner;
  }
  if (!kept.has(tag.name)) return inner;
  return `<${tag.name}>${inner}</${tag.name}>`;
}

export function skipDropped(input: string, cursor: { i: number }, name: string) {
  let depth = 1;
  while (cursor.i < input.length && depth > 0) {
    const start = input.indexOf("<", cursor.i);
    if (start < 0) {
      cursor.i = input.length;
      return;
    }
    const tag = readTag(input, start);
    if (!tag) {
      cursor.i = start + 1;
      continue;
    }
    cursor.i = tag.end;
    if (tag.name !== name || tag.selfClose) continue;
    depth += tag.close ? -1 : 1;
  }
}

export function skipNoise(input: string, start: number) {
  if (input.startsWith("<!--", start)) {
    const end = input.indexOf("-->", start + 4);
    return end < 0 ? input.length : end + 3;
  }
  if (input.startsWith("<!", start) || input.startsWith("<?", start)) {
    const end = input.indexOf(">", start + 2);
    return end < 0 ? input.length : end + 1;
  }
  return start;
}

function imageTag(raw: string) {
  const src = safeMediaSrc(attrValue(raw, "src") ?? "");
  if (!src) return "";
  const alt = safeAlt(attrValue(raw, "alt") ?? "");
  return `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}">`;
}
