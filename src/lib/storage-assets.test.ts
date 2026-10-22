import { describe, expect, it } from "vitest";
import { logoObjectPath, passObjectPath } from "./storage-assets";

const id = "11111111-1111-4111-8111-111111111111";

describe("storage paths", () => {
  it("el logo solo usa el id del organismo y una extensión permitida", () => {
    expect(logoObjectPath(id, "image/png")).toBe(`${id}/logo.png`);
    expect(logoObjectPath(id, "image/jpeg")).toBe(`${id}/logo.jpg`);
    expect(() => logoObjectPath(id, "image/svg+xml")).toThrow("tipo de imagen no permitido");
  });

  it("el pase es un png del perfil", () => {
    expect(passObjectPath(id)).toBe(`${id}/pass.png`);
  });
});
