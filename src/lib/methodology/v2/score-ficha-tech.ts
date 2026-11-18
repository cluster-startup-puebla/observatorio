import { expect, it } from "vitest";
import { V2_EXAMPLES } from "./examples";
import { ordinalScore, V2_ORDINAL_SCORES } from "./ordinal";
import { n2Question } from "./score-ficha-bank";

const ORDINALS: readonly number[] = V2_ORDINAL_SCORES;

it("replay: TECH-06/TECH-07 are 4 unscored cards on the 25/50/75/100 ordinal map; 85 is not emittable", () => {
  expect([...V2_ORDINAL_SCORES]).toEqual([25, 50, 75, 100]);
  for (const example of V2_EXAMPLES) {
    for (const [slot, value] of [
      [6, example.sat[5]],
      [7, example.sat[6]],
    ] as const) {
      const question = n2Question(example.sectorId, slot);
      expect(question.options?.length).toBe(4);
      expect(question.options!.every((option) => option.score === null)).toBe(true);
      if (example.key === "medico-hospitalario" && slot === 6) {
        expect(value).toBe(85);
        expect(ORDINALS.indexOf(value), "85 is rejected by the ordinal map").toBe(-1);
      } else {
        expect(ORDINALS.indexOf(value), `${example.company} TECH-0${slot}=${value} is emittable`).not.toBe(-1);
      }
    }
  }
  for (let i = 0; i < 4; i++) expect(ordinalScore("MD-TECH-06", i)).not.toBe(85);
  expect(() => ordinalScore("MD-TECH-06", 4)).toThrow(/MD-TECH-06/);
  const hospital06 = n2Question("medico-hospitalario", 6);
  expect(hospital06.options![2].label).toMatch(/^Mermas de reactivos entre 0\.5% y 2%/);
  expect(ordinalScore(hospital06.id, 2)).toBe(75);
});

it("replay: TECH-01..04 (P1..P4) have no printed scores, so no card index is claimed for them", () => {
  for (const example of V2_EXAMPLES) {
    for (const slot of [1, 2, 3, 4]) {
      const question = n2Question(example.sectorId, slot);
      expect((question.options ?? []).every((option) => option.score === null), `${question.id} options are unscored`).toBe(true);
    }
  }
});
