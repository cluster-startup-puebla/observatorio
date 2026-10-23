import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isPublicMediaPurpose, mediaPreviewPath } from "./public-access";

const id = "11111111-1111-4111-8111-111111111111";

describe("solo content_image es público", () => {
  it("logo y pase no usan la URL pública", () => {
    expect(isPublicMediaPurpose("content_image")).toBe(true);
    expect(isPublicMediaPurpose("organization_logo")).toBe(false);
    expect(isPublicMediaPurpose("pass_qr")).toBe(false);
    expect(isPublicMediaPurpose("")).toBe(false);
    expect(mediaPreviewPath("content_image", id)).toBe(`/api/medios/${id}`);
    expect(mediaPreviewPath("organization_logo", id)).toBe(`/api/admin/medios/${id}/archivo`);
    expect(mediaPreviewPath("pass_qr", id)).toBe(`/api/admin/medios/${id}/archivo`);
    expect(mediaPreviewPath("pass_qr", id).startsWith("/api/medios/")).toBe(false);
  });

  it("la ruta pública filtra el propósito y la del archivo exige superadmin", () => {
    const pub = readFileSync("src/app/api/medios/[id]/route.ts", "utf8");
    const admin = readFileSync("src/app/api/admin/medios/[id]/archivo/route.ts", "utf8");
    const download = readFileSync("src/lib/medios/content-image.ts", "utf8");
    expect(pub).toContain("isPublicMediaPurpose");
    expect(pub).not.toContain("requireSuperadmin");
    expect(pub).not.toContain("pass_qr");
    expect(download).toContain('.storage.from(bucketId).download(objectPath)');
    expect(download).toContain('bucketId !== "content-images"');
    expect(admin).toContain("await requireSuperadmin()");
  });
});
