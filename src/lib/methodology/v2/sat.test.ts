import { expect, it } from "vitest";
import { satItemScore, satSlot, steppedScore } from "./sat";
import type { V2Question } from "./types";

const tech02 = {
  id: "MM-TECH-02",
  level: "n2",
  sectorId: null,
  section: "SAT",
  widget: "single_select",
  title: "tech 02",
  prompt: "tech 02",
  microcopy: null,
  type: "single_select",
  prefilled: false,
  options: [
    { value: "opt1", label: "1", score: null },
    { value: "opt2", label: "2", score: null },
    { value: "opt3", label: "3", score: null },
    { value: "opt4", label: "4", score: null },
    { value: "opt5", label: "5", score: null },
    { value: "opt6", label: "6", score: null },
  ],
} satisfies V2Question;

it("satSlot lee TECH-02 de ids con prefijo de sector", () => {
  expect(satSlot("MM-TECH-02")).toBe(2);
  expect(satSlot("AU-TECH-02")).toBe(2);
});

it("steppedScore cubre listas de 6 opciones hasta 100", () => {
  expect(steppedScore(0, 6)).toBe(20);
  expect(steppedScore(5, 6)).toBe(100);
  expect(steppedScore(5, 5)).toBeNull();
});

it("TECH-02 con opt6 ya no deja el SAT incompleto", () => {
  expect(satItemScore(tech02, { kind: "single", optionValue: "opt6" }, 2)).toBe(100);
  expect(satItemScore(tech02, { kind: "single", optionValue: "opt1" }, 2)).toBe(20);
});
