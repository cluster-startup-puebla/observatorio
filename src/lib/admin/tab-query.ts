export function tabQuery(raw: string | undefined, allowed: readonly string[], fallback: string) {
  if (raw && allowed.includes(raw)) return raw;
  return fallback;
}
