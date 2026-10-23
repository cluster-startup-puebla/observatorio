export type HtmlTag = {
  end: number;
  close: boolean;
  name: string;
  rawAttrs: string;
  selfClose: boolean;
};

export function readTag(input: string, start: number): HtmlTag | null {
  if (input[start] !== "<") return null;
  let index = start + 1;
  const close = input[index] === "/";
  if (close) index += 1;
  while (isSpace(input[index])) index += 1;
  const nameStart = index;
  if (!/[a-zA-Z]/.test(input[index] ?? "")) return null;
  while (/[a-zA-Z0-9]/.test(input[index] ?? "")) index += 1;
  const name = input.slice(nameStart, index).toLowerCase();
  const attrs = readRawAttrs(input, index);
  if (!attrs) return null;
  return { end: attrs.end, close, name, rawAttrs: attrs.raw, selfClose: attrs.selfClose };
}

function readRawAttrs(input: string, start: number) {
  let index = start;
  let quote = "";
  while (index < input.length) {
    const char = input[index];
    if (quote) {
      if (char === quote) quote = "";
      index += 1;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      index += 1;
      continue;
    }
    if (char === ">") break;
    index += 1;
  }
  if (input[index] !== ">") return null;
  let raw = input.slice(start, index);
  const selfClose = /\/\s*$/.test(raw);
  if (selfClose) raw = raw.replace(/\/\s*$/, "");
  return { end: index + 1, raw, selfClose };
}

function isSpace(char: string | undefined) {
  return char === " " || char === "\n" || char === "\r" || char === "\t";
}
