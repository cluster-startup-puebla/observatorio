export function computeLavaAmount(input: {
  base: number;
  eiaBoost: boolean;
  isEia: boolean;
  multiplier: number;
  flatBonus: number;
}) {
  if (!input.eiaBoost || !input.isEia) return input.base;
  return Math.round(input.base * input.multiplier) + input.flatBonus;
}
