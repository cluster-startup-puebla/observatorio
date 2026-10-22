import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("dispatch del segmento", () => {
  it("el layout solo monta el shell si hay organismo", () => {
    const layout = readFileSync("src/app/[sector]/layout.tsx", "utf8");
    expect(layout).toContain("ownerBySlug");
    expect(layout).toContain("OrgShell");
    expect(layout).toContain("return children");
  });

  it("la landing no se pinta cuando el slug es de un organismo", () => {
    const page = readFileSync("src/app/[sector]/page.tsx", "utf8");
    expect(page).toContain("ownerBySlug");
    expect(page).toContain("OrgHome");
    expect(page).toContain("LandingBody");
  });
});
