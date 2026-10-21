import { describe, expect, it } from "vitest";
import { openRef, sealRef } from "./ref-token";

const secret = "secreto-de-prueba";

describe("ref token", () => {
  it("oculta el organismo y no usa la clave ref", () => {
    const token = sealRef("canacintra", secret);
    expect(token.includes("canacintra")).toBe(false);
    expect(token.startsWith("ref=")).toBe(false);
    expect(openRef(token, secret)).toBe("canacintra");
  });

  it("un token alterado no se atribuye", () => {
    const token = sealRef("canacintra", secret);
    const tampered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;
    expect(openRef(tampered, secret)).toBeNull();
  });

  it("otro secreto no abre el token", () => {
    expect(openRef(sealRef("cce", secret), "otro-secreto")).toBeNull();
  });

  it("rechaza vacío, basura y un token truncado", () => {
    expect(openRef("", secret)).toBeNull();
    expect(openRef("no-es-un-token", secret)).toBeNull();
    expect(openRef(sealRef("canacintra", secret).slice(0, 8), secret)).toBeNull();
  });

  it("no filtra el secreto y conserva un id con acentos", () => {
    const token = sealRef("Cámara de Puebla", secret);
    expect(token.includes(secret)).toBe(false);
    expect(openRef(token, secret)).toBe("Cámara de Puebla");
    expect(sealRef("mismo", secret)).not.toBe(sealRef("mismo", secret));
  });
});
