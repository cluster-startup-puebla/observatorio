import { describe, expect, it } from "vitest";
import { foroPueblaQuotasBySlug, foroPueblaTotal } from "./foro-puebla";

describe("foroPueblaQuotasBySlug", () => {
  it("suma 120 invitados en 13 sectores", () => {
    expect(Object.keys(foroPueblaQuotasBySlug)).toHaveLength(13);
    expect(foroPueblaTotal()).toBe(120);
  });
});
