import { expect, it } from "vitest";
import { bandFor } from "./bands";
import { ordinalScore } from "./ordinal";

it("los cortes de banda son inclusivos en 85, 70 y 50", () => {
  expect(bandFor(85)).toBe("platino");
  expect(bandFor(84.99)).toBe("oro");
  expect(bandFor(70)).toBe("oro");
  expect(bandFor(50)).toBe("plata");
  expect(bandFor(49.99)).toBe("bronce");
});

it("el ordinal de cuatro opciones es 25, 50, 75 y 100", () => {
  expect(ordinalScore("INO-01", 0)).toBe(25);
  expect(ordinalScore("INO-01", 3)).toBe(100);
  expect(() => ordinalScore("INO-01", 4)).toThrow(/INO-01/);
});
