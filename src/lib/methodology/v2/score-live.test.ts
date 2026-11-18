import { expect, it } from "vitest";
import { liveSession, syntheticFixture } from "./live-session";
import { scoreLive } from "./live";
import { ordinalScore } from "./ordinal";

it("scoreLive: real automotriz session scores nivel 1 and reports TECH-01..04 as missing", () => {
  const { questions, answers } = liveSession();
  const score = scoreLive(questions, answers);
  expect(typeof score.ismsNivel1).toBe("number");
  expect(score.estadoDerecho).toBe(52);
  expect(score.innovacion).toBe(56.25);
  expect(score.comercial).toBe(83.33);
  expect(score.ismsNivel1).toBe(62.68);
  // Index 0 on P1 is 20. P2–P4 index 0 is 20. P5 is 60. TECH-06/07 index 1 is 50.
  expect(score.missing).toEqual([]);
  expect(score.satNivel2).toBe(34.29);
  expect(score.ismsNivel2).toBe(48.49);
  expect(score.ib).toBe(28.39);
});

it("scoreLive: TECH-06/07 ordinal index maps 0..3 to 25/50/75/100 and rejects other indexes", () => {
  expect([0, 1, 2, 3].map((index) => ordinalScore("AU-TECH-06", index))).toEqual([25, 50, 75, 100]);
  expect(() => ordinalScore("AU-TECH-07", 4)).toThrow(/AU-TECH-07/);
  expect(() => ordinalScore("AU-TECH-07", -1)).toThrow(/AU-TECH-07/);
});

it("scoreLive: unanswered ED item throws naming the id; unanswered TECH-06 is reported missing", () => {
  const { questions, answers } = liveSession();
  const noEd = { ...answers };
  delete noEd["ED-02"];
  expect(() => scoreLive(questions, noEd)).toThrow(/Missing answer: ED-02/);
  const noTech = { ...answers };
  delete noTech["AU-TECH-06"];
  const partial = scoreLive(questions, noTech);
  expect(partial.missing).toContain("AU-TECH-06");
  expect(partial.satNivel2).toBeNull();
  expect(partial.ismsNivel2).toBeNull();
  expect(partial.ib).toBeNull();
  expect(partial.band).toBeNull();
});

it("scoreLive: synthetic ids with scored options behave like scoreV2 for nivel 1", () => {
  const { questions, answers } = syntheticFixture();
  const live = scoreLive(questions, answers);
  expect(live.ismsNivel1).toBe(62.68);
  expect(live.satNivel2).toBe(57.14);
});
