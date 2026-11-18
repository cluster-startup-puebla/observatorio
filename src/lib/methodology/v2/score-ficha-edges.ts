import { expect, it } from "vitest";
import { scoreExample, V2_EXAMPLES } from "./examples";
import { fixture } from "./score-ficha-fixture";
import { scoreV2 } from "./score";

it("P5 with a null option score contributes 60", () => {
  const { questions, answers } = fixture({
    ed: [40, 40, 40, 40, 40],
    ino: [25, 25, 37.5, 37.5],
    com: [50, 50, 50],
    sat: [20, 40, 20, 20, 0, 25, 25],
  });
  const p5 = questions.find((q) => q.id === "P5")!;
  p5.options = [{ value: "P5-opt", label: "P5", score: null }];
  const s = scoreV2(questions, answers);
  expect(s.satNivel2).toBe(30);
});

it("missing ED-03 throws naming the id", () => {
  const { questions, answers } = fixture({
    ed: [40, 40, 40, 40, 40],
    ino: [50, 50, 50, 50],
    com: [50, 50, 50],
    sat: [50, 50, 50, 50, 50, 50, 50],
  });
  expect(() => scoreV2(questions.filter((q) => q.id !== "ED-03"), answers)).toThrow(/ED-03/);
  const missingAnswer = { ...answers };
  delete missingAnswer["ED-03"];
  expect(() => scoreV2(questions, missingAnswer)).toThrow(/ED-03/);
});

it("null score on a non-P5 item throws naming the id", () => {
  const { questions, answers } = fixture({
    ed: [40, 40, 40, 40, 40],
    ino: [50, 50, 50, 50],
    com: [50, 50, 50],
    sat: [50, 50, 50, 50, 50, 50, 50],
  });
  questions.find((q) => q.id === "P2")!.options = [{ value: "P2-opt", label: "P2", score: null }];
  expect(() => scoreV2(questions, answers)).toThrow(/P2/);
});

it("band thresholds are inclusive at 85, 70 and 50", () => {
  const cases: Array<[number, string]> = [
    [85, "platino"],
    [84.99, "oro"],
    [70, "oro"],
    [69.99, "plata"],
    [50.1, "plata"],
    [50, "plata"],
    [49.99, "bronce"],
  ];
  for (const [score, band] of cases) {
    const { questions, answers } = fixture({
      ed: [score, score, score, score, score],
      ino: [score, score, score, score],
      com: [score, score, score],
      sat: [score, score, score, score, score, score, score],
    });
    const s = scoreV2(questions, answers);
    expect(s.ismsNivel2).toBe(score);
    expect(s.band).toBe(band);
  }
});

it("fichas: stated nivel-1 item scores + stated SAT parts reproduce the headline", () => {
  for (const example of V2_EXAMPLES) {
    const s = scoreExample(example);
    const label = `${example.company}`;
    expect(s.ismsNivel1, `${label} isms1`).toBe(example.expected.ismsNivel1);
    expect(s.satNivel2, `${label} sat`).toBe(example.expected.satNivel2);
    expect(s.ismsNivel2, `${label} isms2`).toBe(example.expected.ismsNivel2);
    expect(s.band, `${label} band`).toBe(example.expected.band);
    if (example.expected.ib !== undefined) expect(s.ib, `${label} ib`).toBe(example.expected.ib);
  }
  const byKey = Object.fromEntries(V2_EXAMPLES.map((e) => [e.key, e.expected.ismsNivel2]));
  expect(byKey).toEqual({
    automotriz: 59.91,
    plasticos: 35.19,
    "medico-hospitalario": 72.59,
    logistica: 50.1,
  });
});
