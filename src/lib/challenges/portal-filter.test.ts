import { describe, expect, it } from "vitest";
import { isPortalVisible } from "./portal-filter";

describe("isPortalVisible", () => {
  it("only published portal challenges", () => {
    expect(isPortalVisible({ status: "publicado", visibility: "portal" })).toBe(true);
    expect(isPortalVisible({ status: "publicado", visibility: "red" })).toBe(false);
    expect(isPortalVisible({ status: "oculto", visibility: "portal" })).toBe(false);
    expect(isPortalVisible({ status: "borrador", visibility: "portal" })).toBe(false);
    expect(isPortalVisible({ status: "cerrado", visibility: "portal" })).toBe(false);
  });
});
