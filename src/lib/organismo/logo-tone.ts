import { brandBackground, contrastRatio } from "./brand-color";

export type Rgba = { r: number; g: number; b: number; a: number };

const LOW_CHROMA = 0.08;
const COLOR_CHROMA = 0.2;
const COLOR_SHARE = 0.02;
const TONE_DELTA = 36;
const TONE_SHARE = 0.9;
const POOR_CONTRAST = 3;

function chroma(pixel: Rgba) {
  const high = Math.max(pixel.r, pixel.g, pixel.b);
  const low = Math.min(pixel.r, pixel.g, pixel.b);
  return (high - low) / 255;
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

function hexByte(value: number) {
  return Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0");
}

export function logoNeedsMonochromeInk(pixels: Rgba[], sidebarHex: string | null | undefined) {
  const opaque = pixels.filter((pixel) => pixel.a >= 128);
  if (opaque.length === 0) return false;
  const colored = opaque.filter((pixel) => chroma(pixel) >= COLOR_CHROMA).length / opaque.length;
  if (colored >= COLOR_SHARE) return false;
  const mean = opaque.reduce((sum, pixel) => sum + chroma(pixel), 0) / opaque.length;
  if (mean > LOW_CHROMA) return false;
  const mid = {
    r: median(opaque.map((pixel) => pixel.r)),
    g: median(opaque.map((pixel) => pixel.g)),
    b: median(opaque.map((pixel) => pixel.b)),
  };
  const close =
    opaque.filter((pixel) => {
      const delta = Math.max(Math.abs(pixel.r - mid.r), Math.abs(pixel.g - mid.g), Math.abs(pixel.b - mid.b));
      return delta <= TONE_DELTA;
    }).length / opaque.length;
  if (close < TONE_SHARE) return false;
  const hex = `#${hexByte(mid.r)}${hexByte(mid.g)}${hexByte(mid.b)}`;
  const ratio = contrastRatio(hex, brandBackground(sidebarHex));
  return ratio != null && ratio < POOR_CONTRAST;
}
