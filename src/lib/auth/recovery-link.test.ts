import { describe, expect, it } from "vitest";
import { freshPasswordError } from "./password-change";
import { recoveryHash, recoveryRedirect, storedRecovery } from "./recovery-link";

describe("recuperación de contraseña", () => {
  it("arma el regreso del enlace en el sitio", () => {
    expect(recoveryRedirect("https://observatorio.clusterdestartups.org/")).toBe(
      "https://observatorio.clusterdestartups.org/restablecer",
    );
    expect(recoveryRedirect("")).toBeUndefined();
  });

  it("solo acepta el hash de recuperación", () => {
    expect(recoveryHash("#access_token=a&refresh_token=b&type=recovery")).toEqual({ access: "a", refresh: "b" });
    expect(recoveryHash("#access_token=a&refresh_token=b&type=signup")).toBeNull();
    expect(recoveryHash("")).toBeNull();
  });

  it("recupera el permiso guardado para una recarga", () => {
    expect(storedRecovery(JSON.stringify({ access: "a", refresh: "b" }))).toEqual({ access: "a", refresh: "b" });
    expect(storedRecovery("")).toBeNull();
    expect(storedRecovery("{")).toBeNull();
  });

  it("la contraseña nueva pide ocho caracteres y que coincida", () => {
    expect(freshPasswordError("corta", "corta")).toBe("corta");
    expect(freshPasswordError("nueva-clave", "otra-clave")).toBe("distinta");
    expect(freshPasswordError("nueva-clave", "nueva-clave")).toBeNull();
  });
});
