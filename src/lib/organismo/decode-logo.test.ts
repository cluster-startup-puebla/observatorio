import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { decodeLogoPixels } from "./decode-logo";
import { logoNeedsMonochromeInk } from "./logo-tone";

async function image(background: string, format: "png" | "jpeg" | "webp") {
  const file = sharp({
    create: { width: 8, height: 8, channels: 3, background },
  });
  if (format === "png") return new Uint8Array(await file.png().toBuffer());
  if (format === "jpeg") return new Uint8Array(await file.jpeg().toBuffer());
  return new Uint8Array(await file.webp().toBuffer());
}

describe("bytes del logo", () => {
  it("lee png, jpg y webp de un tono", async () => {
    for (const format of ["png", "jpeg", "webp"] as const) {
      const type = format === "jpeg" ? "image/jpeg" : `image/${format}`;
      const pixels = await decodeLogoPixels(await image("#111111", format), type);
      expect(pixels?.length).toBeGreaterThan(0);
      expect(logoNeedsMonochromeInk(pixels ?? [], "#020041")).toBe(true);
    }
  });

  it("un archivo ilegible queda sin filtro", async () => {
    expect(await decodeLogoPixels(new Uint8Array([1, 2, 3, 4]), "image/png")).toBeNull();
    expect(await decodeLogoPixels(new Uint8Array([1, 2, 3, 4]), "image/gif")).toBeNull();
  });
});
