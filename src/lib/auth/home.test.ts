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

  it("con slug manda al organismo a su raíz", () => {
    expect(homeForRole("director", "canacintra")).toBe("/canacintra");
    expect(homeForRole("capturista", "canacintra")).toBe("/canacintra");
    expect(homeForRole("invitador", "canacintra")).toBe("/canacintra");
    expect(homeForRole("superadmin", "canacintra")).toBe("/admin");
    expect(homeForRole("director", "")).toBe("/organismo");
    expect(homeForRole("director", null)).toBe("/organismo");
  });

  it("rechaza un rol que no está en el enum", () => {
    expect(isAccountRole("gobierno")).toBe(false);
    expect(isAccountRole("empresario")).toBe(true);
  });
});

