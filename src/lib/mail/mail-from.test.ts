import { describe, expect, it } from "vitest";
import { mailFrom } from "./mail-from";

describe("mailFrom", () => {
  it("deja un correo pelón", () => {
    expect(mailFrom("noreply@notificaciones.clusterdestartups.org")).toBe(
      "noreply@notificaciones.clusterdestartups.org",
    );
  });

  it("quita las comillas que envuelven Nombre <correo>", () => {
    expect(mailFrom('"Foro Puebla x Puebla <noreply@notificaciones.clusterdestartups.org>"')).toBe(
      "Foro Puebla x Puebla <noreply@notificaciones.clusterdestartups.org>",
    );
  });

  it("rechaza un nombre sin correo", () => {
    expect(mailFrom("Foro Puebla x Puebla")).toBeNull();
    expect(mailFrom("")).toBeNull();
  });
});
