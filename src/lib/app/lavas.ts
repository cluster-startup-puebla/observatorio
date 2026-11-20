export const LAVAS_TOOLTIP =
  "Toca para ver cómo ganar lavas y tu historial. Las lavas reconocen tu participación; no definen el estatus EIA.";

export function lavasLabel(balance: number) {
  const n = Math.max(0, Math.trunc(balance));
  return n === 1 ? "1 lava" : `${n} lavas`;
}
