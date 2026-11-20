import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("dispatch del segmento", () => {
  it("el layout solo monta el shell si hay organismo", () => {
    const layout = readFileSync("src/app/[sector]/layout.tsx", "utf8");
    expect(layout).toContain("ownerBySlug");
    expect(layout).toContain("OrgShell");
    expect(layout).toContain("return children");
  });

  it("la ruta vieja redirige a la sesión", () => {
    const page = readFileSync("src/app/[sector]/page.tsx", "utf8");
    expect(page).toContain("redirectLegacyPiece");
    expect(page).not.toContain("EventLanding");
  });
});
