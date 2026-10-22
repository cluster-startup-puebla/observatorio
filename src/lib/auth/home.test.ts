import { describe, expect, it } from "vitest";
import { homeForRole, isAccountRole } from "./home";

describe("homeForRole", () => {
  it("manda cada rol a la ruta que ya existe", () => {
    expect(homeForRole("superadmin")).toBe("/admin");
    expect(homeForRole("moderador")).toBe("/mesa");
    expect(homeForRole("empresario")).toBe("/metodologia");
    expect(homeForRole("director")).toBe("/organismo");
    expect(homeForRole("capturista")).toBe("/organismo");
    expect(homeForRole("invitador")).toBe("/organismo");
  });

  it("rechaza un rol que no está en el enum", () => {
    expect(isAccountRole("gobierno")).toBe(false);
    expect(isAccountRole("empresario")).toBe(true);
  });
});
