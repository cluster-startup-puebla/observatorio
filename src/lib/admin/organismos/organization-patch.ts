export function organizationPatch(input: { name: string; brandColor: string }) {
  const name = input.name.trim();
  if (name.length < 2 || name.length > 160) return { ok: false as const, reason: "nombre inválido" };
  const brandColor = input.brandColor.trim();
  if (!/^#[0-9A-Fa-f]{6}$/.test(brandColor)) return { ok: false as const, reason: "color inválido" };
  return { ok: true as const, name, brand_color: brandColor };
}
