import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("detalle de medios", () => {
  it("el reemplazo usa el bucket del propósito", () => {
    const source = readFileSync("src/app/api/admin/medios/[id]/route.ts", "utf8");
    const detail = readFileSync("src/lib/admin/medios/detail.ts", "utf8");
    expect(source).toContain("await requireSuperadmin()");
    expect(source).toContain("mediaTarget");
    expect(source).toContain("mediaByteLimit");
    expect(source).toContain(".storage");
    expect(source).toContain('.from("media_assets")');
    expect(detail).toContain("organization_logo");
    expect(detail).toContain("content_image");
    expect(detail).toContain("pass_qr");
    expect(source).not.toContain("bytea");
  });
});
