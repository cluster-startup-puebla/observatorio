import { escapeAttr } from "./sector-body-rules";

const align = /^(left|center|right|justify)$/i;
const hexColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function safeChallengeStyle(raw: string) {
  const kept: string[] = [];
  for (const part of raw.split(";")) {
    const colon = part.indexOf(":");
    if (colon < 0) continue;
    const prop = part.slice(0, colon).trim().toLowerCase();
    const value = part.slice(colon + 1).trim();
    if (!value) continue;
    if (prop === "text-align" && align.test(value)) {
      kept.push(`text-align: ${value.toLowerCase()}`);
      continue;
    }
    if (prop === "color" && hexColor.test(value)) {
      kept.push(`color: ${value.toLowerCase()}`);
    }
  }
  if (kept.length === 0) return null;
  return escapeAttr(kept.join("; "));
}
