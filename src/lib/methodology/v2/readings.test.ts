import { expect, it } from "vitest";
import { frontierReading, gapZone, useReading } from "./readings";

it("each percentage band has its own message", () => {
  expect(useReading(100).body).toMatch(/100%/);
  expect(useReading(85).body).toMatch(/cerca/);
  expect(useReading(70).body).toMatch(/margen/);
  expect(useReading(50).body).toMatch(/adorno/);
  expect(useReading(20).body).toMatch(/mayor parte/);
  expect(frontierReading(100).body).toMatch(/techo/);
  expect(frontierReading(80).body).toMatch(/Tienes 80/);
  expect(frontierReading(40).body).toMatch(/Tienes 40/);
  expect(frontierReading(20).body).toMatch(/lejos/);
});

it("gap zones follow the manual cuts", () => {
  expect(gapZone(10.01)).toBe("Falsa complacencia");
  expect(gapZone(10)).toBe("Alineado");
  expect(gapZone(-10)).toBe("Alineado");
  expect(gapZone(-10.01)).toBe("Cautela");
});

it("una brecha de más de 10 es falsa complacencia", () => {
  expect(gapZone(10.01)).toBe("Falsa complacencia");
  expect(gapZone(-10.01)).toBe("Cautela");
  expect(gapZone(0)).toBe("Alineado");
});

it("aprovechar 100 no pide comprar más", () => {
  expect(useReading(100).body).toContain("100%");
});
