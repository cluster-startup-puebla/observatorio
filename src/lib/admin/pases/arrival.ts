export function canMarkArrival(input: { hasPass: boolean; hasArrival: boolean }) {
  if (!input.hasPass) return { ok: false as const, reason: "sin qr" };
  if (input.hasArrival) return { ok: false as const, reason: "ya llegó" };
  return { ok: true as const };
}
