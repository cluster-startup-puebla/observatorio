import { describe, expect, it } from "vitest";
import { mailBrand, publicFacts } from "./brand";

describe("marca del correo", () => {
  it("usa el rosa y el navy de la landing", () => {
    expect(mailBrand.pink).toBe("#e8186a");
    expect(mailBrand.navy).toBe("#16284f");
    expect(mailBrand.replyTo).toBe("hola@clusterdestartups.org");
  });

  it("sin sesión cita la fecha, el hotel y el horario públicos", () => {
    expect(publicFacts(null)).toEqual([
      { label: "Fecha", value: "Miércoles 18 de noviembre de 2026" },
      { label: "Dónde", value: "Hotel Quinta Real, Puebla" },
      { label: "Horario", value: "8:30 am – 11:30 am" },
    ]);
  });

  it("con sesión cita solo esa ficha", () => {
    expect(publicFacts("Quinta Real · 18 de noviembre de 2026 · 08:00–11:45")).toEqual([
      { label: "Sesión", value: "Quinta Real · 18 de noviembre de 2026 · 08:00–11:45" },
    ]);
  });
});
