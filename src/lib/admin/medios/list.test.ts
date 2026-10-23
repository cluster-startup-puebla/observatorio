import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { mediaByteLimit, mediaTarget } from "./target";

const id = "11111111-1111-4111-8111-111111111111";

describe("lista de medios", () => {
  it("arma la ruta de logo, pase e imagen de contenido", () => {
    expect(mediaTarget({ purpose: "organization_logo", organizationId: id, contentType: "image/png" })).toEqual({
      bucket: "organization-logos",
      path: `${id}/logo.png`,
    });
    expect(mediaTarget({ purpose: "pass_qr", profileId: id, contentType: "image/png" })).toEqual({
      bucket: "pass-images",
      path: `${id}/pass.png`,
    });
    expect(mediaTarget({ purpose: "content_image", slug: "objetivo", filename: "foto.png", contentType: "image/png" })).toEqual({
      bucket: "content-images",
      path: "objetivo/foto.png",
    });
    expect(mediaByteLimit("organization_logo")).toBe(2_097_152);
    expect(mediaByteLimit("pass_qr")).toBe(524_288);
    expect(mediaByteLimit("content_image")).toBe(4_194_304);
    expect(() => mediaTarget({ purpose: "pass_qr", profileId: id, contentType: "image/jpeg" })).toThrow("el pase es png");
    expect(mediaTarget({ purpose: "company_logo", profileId: id, contentType: "image/png" })).toEqual({
      bucket: "company-logos",
      path: `${id}/logo.png`,
    });
    expect(mediaByteLimit("company_logo")).toBe(2_097_152);
  });

  it("la lista lee media_assets", () => {
    const list = readFileSync("src/lib/admin/medios/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/medios/route.ts", "utf8");
    expect(list).toContain('.from("media_assets")');
    expect(list).toContain("purpose");
    expect(list).toContain("bucket_id");
    expect(list).toContain("object_path");
    expect(list).toContain(".range(page.from, page.to)");
    expect(route).toContain("await requireSuperadmin()");
  });
});
