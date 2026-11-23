import { expect, it } from "vitest";
import { sessionVisibleToSector } from "./session-visible";

it("sin filas de cupo la sesión es abierta para cualquier sector", () => {
  expect(sessionVisibleToSector([], "turismo")).toBe(true);
  expect(sessionVisibleToSector(null, "turismo")).toBe(true);
});

it("con cupos solo entra el sector listado", () => {
  const rows = [{ sector_id: "a" }, { sector_id: "b" }];
  expect(sessionVisibleToSector(rows, "a")).toBe(true);
  expect(sessionVisibleToSector(rows, "c")).toBe(false);
});
