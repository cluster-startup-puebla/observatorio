import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { passwordChangeError } from "./password-change";

describe("passwordChangeError", () => {
  it("pide la actual, ocho caracteres y que la nueva coincida", () => {
    expect(passwordChangeError({ current: "corta", next: "nueva-clave", confirm: "nueva-clave" })).toBe("actual");
    expect(passwordChangeError({ current: "clave-actual", next: "corta", confirm: "corta" })).toBe("corta");
    expect(passwordChangeError({ current: "clave-actual", next: "nueva-clave", confirm: "otra-clave" })).toBe(
      "distinta",
    );
    expect(passwordChangeError({ current: "clave-actual", next: "clave-actual", confirm: "clave-actual" })).toBe(
      "igual",
    );
  });

  it("acepta una contraseña nueva distinta", () => {
    expect(passwordChangeError({ current: "clave-actual", next: "nueva-clave", confirm: "nueva-clave" })).toBeNull();
  });

  it("guarda la sesión que queda después de cambiarla", () => {
    const source = readFileSync("src/lib/auth/change-password-action.ts", "utf8");
    expect(source.indexOf("updateUser")).toBeLessThan(source.indexOf("getSession"));
    expect(source).toContain("latest.data.session ?? ready.data.session");
  });
});
