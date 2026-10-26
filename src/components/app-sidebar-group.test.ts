import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("menú móvil", () => {
  it("cierra el sheet al seguir un enlace", () => {
    const source = readFileSync("src/components/app-sidebar-group.tsx", "utf8");
    expect(source).toContain("setOpenMobile(false)");
  });
});
