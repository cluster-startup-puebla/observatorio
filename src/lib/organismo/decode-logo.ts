import sharp from "sharp";
import type { Rgba } from "./logo-tone";

const TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const STEP_TARGET = 96;

function sample(data: Buffer, width: number, height: number, channels: number): Rgba[] {
  const stepX = Math.max(1, Math.ceil(width / STEP_TARGET));
  const stepY = Math.max(1, Math.ceil(height / STEP_TARGET));
  const pixels: Rgba[] = [];
  for (let y = 0; y < height; y += stepY) {
    for (let x = 0; x < width; x += stepX) {
      const index = (y * width + x) * channels;
      const red = data[index] ?? 0;
      const green = channels > 1 ? (data[index + 1] ?? red) : red;
      const blue = channels > 2 ? (data[index + 2] ?? red) : red;
      const alpha = channels > 3 ? (data[index + 3] ?? 255) : 255;
      pixels.push({ r: red, g: green, b: blue, a: alpha });
    }
  }
  return pixels;
}

export async function decodeLogoPixels(bytes: Uint8Array, contentType: string): Promise<Rgba[] | null> {
  if (!TYPES.has(contentType)) return null;
  try {
    const { data, info } = await sharp(Buffer.from(bytes)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    if (!info.width || !info.height) return null;
    return sample(data, info.width, info.height, info.channels);
  } catch {
    return null;
  }
}
