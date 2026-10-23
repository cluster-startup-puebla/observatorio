export function attrValue(raw: string, name: string) {
  return readAttrs(raw).find((attr) => attr.name === name)?.value ?? null;
}

function readAttrs(raw: string) {
  const attrs: { name: string; value: string }[] = [];
  let index = 0;
  while (index < raw.length) {
    while (isSpace(raw[index])) index += 1;
    if (index >= raw.length) break;
    if (!/[a-zA-Z_:]/.test(raw[index] ?? "")) {
      index += 1;
      continue;
    }
    const nameStart = index;
    while (/[^\s=]/.test(raw[index] ?? "")) index += 1;
    const name = raw.slice(nameStart, index).toLowerCase();
    while (isSpace(raw[index])) index += 1;
    if (raw[index] !== "=") {
      attrs.push({ name, value: "" });
      continue;
    }
    index += 1;
    while (isSpace(raw[index])) index += 1;
    const quoted = readQuoted(raw, index);
    attrs.push({ name, value: quoted.value });
    index = quoted.end;
  }
  return attrs;
}

function readQuoted(raw: string, index: number) {
  const quote = raw[index];
  if (quote !== '"' && quote !== "'") {
    const start = index;
    while (index < raw.length && !isSpace(raw[index])) index += 1;
    return { value: raw.slice(start, index), end: index };
  }
  const end = raw.indexOf(quote, index + 1);
  if (end < 0) return { value: raw.slice(index + 1), end: raw.length };
  return { value: raw.slice(index + 1, end), end: end + 1 };
}

function isSpace(char: string | undefined) {
  return char === " " || char === "\n" || char === "\r" || char === "\t";
}
