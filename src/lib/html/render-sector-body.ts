import { readTag } from "./html-tag";
import { emitTag, skipDropped, skipNoise } from "./sector-body-emit";
import { escapeText } from "./sector-body-rules";

const dropContent = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "template",
  "svg",
  "math",
  "textarea",
  "noembed",
  "frameset",
  "applet",
]);

export function renderSectorBody(input: string) {
  return render(input, { i: 0 }, null);
}

function render(input: string, cursor: { i: number }, stop: string | null): string {
  let html = "";
  while (cursor.i < input.length) {
    const start = input.indexOf("<", cursor.i);
    if (start < 0) return html + escapeText(input.slice(cursor.i));
    if (start > cursor.i) html += escapeText(input.slice(cursor.i, start));
    const noise = skipNoise(input, start);
    if (noise > start) {
      cursor.i = noise;
      continue;
    }
    const tag = readTag(input, start);
    if (!tag) {
      html += "&lt;";
      cursor.i = start + 1;
      continue;
    }
    cursor.i = tag.end;
    if (tag.close) {
      if (stop && tag.name === stop) return html;
      continue;
    }
    if (dropContent.has(tag.name)) {
      if (!tag.selfClose) skipDropped(input, cursor, tag.name);
      continue;
    }
    html += emitTag(input, cursor, tag, render);
  }
  return html;
}
