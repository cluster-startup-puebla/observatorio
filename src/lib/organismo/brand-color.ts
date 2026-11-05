import type { CSSProperties } from "react";

const HEX = /^#[0-9A-Fa-f]{6}$/;
const FALLBACK = "#16284F";
const LIGHT_INK = "#f5f6f8";
const DARK_INK = "#16284f";

export function isBrandHex(value: string | null | undefined): value is string {
  return typeof value === "string" && HEX.test(value.trim());
}

export function brandBackground(value: string | null | undefined) {
  const hex = value?.trim() ?? "";
  return isBrandHex(hex) ? hex : FALLBACK;
}

function channel(value: number) {
  const unit = value / 255;
  return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string) {
  if (!isBrandHex(hex)) return null;
  const raw = hex.trim();
  const red = Number.parseInt(raw.slice(1, 3), 16);
  const green = Number.parseInt(raw.slice(3, 5), 16);
  const blue = Number.parseInt(raw.slice(5, 7), 16);
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
}

export function contrastRatio(left: string, right: string) {
  const lighter = relativeLuminance(left);
  const darker = relativeLuminance(right);
  if (lighter == null || darker == null) return null;
  const [high, low] = lighter >= darker ? [lighter, darker] : [darker, lighter];
  return (high + 0.05) / (low + 0.05);
}

export function sidebarInk(value: string | null | undefined) {
  const background = brandBackground(value);
  const onLight = contrastRatio(background, LIGHT_INK) ?? 0;
  const onDark = contrastRatio(background, DARK_INK) ?? 0;
  const darkBar = onLight >= onDark;
  return { background, ink: darkBar ? LIGHT_INK : DARK_INK, darkBar };
}

export function sidebarBrandStyle(value: string | null | undefined): CSSProperties | undefined {
  if (value == null || value.trim() === "") return undefined;
  const tone = sidebarInk(value);
  const accent = tone.darkBar ? "rgb(255 255 255 / 12%)" : "rgb(22 40 79 / 8%)";
  const border = tone.darkBar ? "rgb(255 255 255 / 16%)" : "rgb(22 40 79 / 16%)";
  return {
    "--sidebar": tone.background,
    "--sidebar-foreground": tone.ink,
    "--sidebar-accent": accent,
    "--sidebar-accent-foreground": tone.ink,
    "--sidebar-border": border,
  } as CSSProperties;
}
