import { expect, it } from "vitest";
import { fixture, round2 } from "./score-ficha-fixture";
import { scoreV2 } from "./score";

it("Automotriz troquelados matches the ficha", () => {
  const { questions, answers } = fixture({
    ed: [40, 50, 50, 60, 60],
    ino: [50, 50, 62.5, 62.5],
    com: [75, 75, 100],
    sat: [60, 60, 60, 60, 60, 50, 50],
  });
  expect(round2(250 / 3)).toBe(83.33);
  const s = scoreV2(questions, answers);
  expect(s.estadoDerecho).toBe(52);
  expect(s.innovacion).toBe(56.25);
  expect(s.comercial).toBe(83.33);
  expect(s.ismsNivel1).toBe(62.68);
  expect(s.satNivel2).toBe(57.14);
  expect(s.ismsNivel2).toBe(59.91);
  expect(s.ib).toBe(5.54);
  expect(s.band).toBe("plata");
});

it("Plasticos matches the ficha (P5 text answer contributes constant 60)", () => {
  const { questions, answers } = fixture({
    ed: [40, 40, 40, 40, 40],
    ino: [25, 25, 37.5, 37.5],
    com: [50, 50, 50],
    sat: [20, 40, 20, 20, 0, 25, 25],
    p5Text: true,
  });
  const s = scoreV2(questions, answers);
  expect(s.estadoDerecho).toBe(40);
  expect(s.innovacion).toBe(31.25);
  expect(s.comercial).toBe(50);
  expect(s.ismsNivel1).toBe(40.38);
  expect(s.satNivel2).toBe(30);
  expect(s.ismsNivel2).toBe(35.19);
  expect(s.ib).toBe(10.38);
  expect(s.band).toBe("bronce");
});

it("Hospital San Jose matches the ficha", () => {
  const { questions, answers } = fixture({
    ed: [50, 50, 60, 60, 60],
    ino: [75, 75, 62.5, 62.5],
    com: [75, 75, 100],
    sat: [80, 80, 80, 80, 60, 85, 75],
  });
  const s = scoreV2(questions, answers);
  expect(s.estadoDerecho).toBe(56);
  expect(s.innovacion).toBe(68.75);
  expect(s.comercial).toBe(83.33);
  expect(s.ismsNivel1).toBe(68.03);
  expect(s.satNivel2).toBe(77.14);
  expect(s.ismsNivel2).toBe(72.59);
  expect(s.ib).toBe(-9.11);
  expect(s.band).toBe("oro");
});

it("Logistica matches the ficha", () => {
  const { questions, answers } = fixture({
    ed: [40, 40, 40, 40, 40],
    ino: [50, 50, 37.5, 37.5],
    com: [75, 75, 75],
    sat: [40, 60, 40, 40, 60, 50, 50],
  });
  const s = scoreV2(questions, answers);
  expect(s.estadoDerecho).toBe(40);
  expect(s.innovacion).toBe(43.75);
  expect(s.comercial).toBe(75);
  expect(s.ismsNivel1).toBe(51.63);
  expect(s.satNivel2).toBe(48.57);
  expect(s.ismsNivel2).toBe(50.1);
  expect(s.ib).toBe(3.06);
  expect(s.band).toBe("plata");
});
