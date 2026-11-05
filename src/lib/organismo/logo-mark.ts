import "server-only";

import { sidebarInk } from "./brand-color";
import { decodeLogoPixels } from "./decode-logo";
import { logoNeedsMonochromeInk } from "./logo-tone";
import type { OrgLogo } from "./resolve-logo";

export type MonochromeInk = "light" | "dark";

export async function monochromeInkFor(
  logo: OrgLogo | undefined,
  brandColor: string | undefined,
): Promise<MonochromeInk | undefined> {
  if (!logo?.bytes || !logo.contentType || !brandColor?.trim()) return undefined;
  const tone = sidebarInk(brandColor);
  const pixels = await decodeLogoPixels(logo.bytes, logo.contentType);
  if (!pixels || !logoNeedsMonochromeInk(pixels, tone.background)) return undefined;
  return tone.darkBar ? "light" : "dark";
}
