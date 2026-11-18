import { expect, it } from "vitest";
import { summarize } from "./summary";

it("promedia solo las notas cerradas y cuenta las bandas", () => {
  const result = summarize([
    { instrumentId: "alimentos", score: { ismsNivel2: 80, band: "oro" } },
    { instrumentId: "alimentos", score: { ismsNivel2: 60, band: "plata" } },
    { instrumentId: "plasticos", score: null },
  ]);
  expect(result.average).toBe(70);
  expect(result.finished).toBe(2);
  expect(result.bands).toEqual({ oro: 1, plata: 1 });
  expect(result.byInstrument).toEqual([{ instrumentId: "alimentos", average: 70, finished: 2 }]);
});
