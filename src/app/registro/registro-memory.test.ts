import { afterEach, describe, expect, it } from "vitest";
import { readRegistroDone, registroStorageKey, rememberRegistro } from "./registro-memory";

function installFakeWindow() {
  const store = new Map<string, string>();
  const fakeWindow = {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    },
  };
  (globalThis as unknown as { window?: typeof fakeWindow }).window = fakeWindow;
  return store;
}

afterEach(() => {
  delete (globalThis as unknown as { window?: unknown }).window;
});

describe("registro-memory", () => {
  it("bloquea solo la sesión en la que se registró y permite inscribirse a otras", () => {
    const store = installFakeWindow();
    store.set("observatorio-registro", "1");

    expect(readRegistroDone("sesion-foro")).toBe(false);
    expect(readRegistroDone("sesion-disruptors")).toBe(false);

    rememberRegistro("sesion-foro");

    expect(store.get(registroStorageKey("sesion-foro"))).toBe("1");
    expect(readRegistroDone("sesion-foro")).toBe(true);
    expect(readRegistroDone("sesion-disruptors")).toBe(false);
  });

  it("no guarda ni bloquea cuando sessionId está vacío", () => {
    const store = installFakeWindow();
    rememberRegistro("   ");
    expect(store.size).toBe(0);
    expect(readRegistroDone("   ")).toBe(false);
  });
});
