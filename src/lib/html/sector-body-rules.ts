const named: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  colon: ":",
  nbsp: " ",
};

const mediaSrc =
  /^\/api\/medios\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export function escapeText(value: string) {
  return decodeHtml(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function escapeAttr(value: string) {
  return escapeText(value).replace(/"/g, "&quot;");
}

export function safeMediaSrc(value: string) {
  const match = mediaSrc.exec(cleaned(value));
  if (!match) return null;
  return `/api/medios/${match[1].toLowerCase()}`;
}

export function safeHref(value: string) {
  const href = cleaned(value);
  if (!href || href.length > 2048 || !/^https?:\/\//i.test(href)) return null;
  if (/[\s<>"'\\]/.test(href)) return null;
  try {
    const url = new URL(href);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
  } catch {
    return null;
  }
  return href;
}

export function safeAlt(value: string) {
  return cleaned(value).slice(0, 180);
}

function cleaned(value: string) {
  return decodeHtml(value).replace(/[\u0000-\u001f\u007f]/g, "").trim();
}

function decodeHtml(value: string) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (all, entity: string) => {
    if (entity[0] !== "#") return named[entity.toLowerCase()] ?? all;
    const hex = entity[1] === "x" || entity[1] === "X";
    const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
    if (!Number.isInteger(code) || code < 0 || code > 0x10ffff) return "";
    return String.fromCodePoint(code);
  });
}
