import { expect, it } from "vitest";
import { flushPlan } from "./flush";

const base = { phase: "general" as const, answerCount: 4, pending: true, online: true };

it("la primera respuesta avisa que empezó", () => {
  expect(flushPlan({ ...base, answerCount: 1, entering: "answer" })).toBe("start");
});

it("las respuestas de en medio no salen del teléfono", () => {
  expect(flushPlan({ ...base, entering: "answer" })).toBeNull();
});

it("la cortina y el cierre sí se mandan", () => {
  expect(flushPlan({ ...base, entering: "curtain" })).toBe("curtain");
  expect(flushPlan({ ...base, phase: "done", entering: "done" })).toBe("done");
});

it("sin red no hay envío, y al volver se reintenta si quedó pendiente", () => {
  expect(flushPlan({ ...base, online: false, entering: "curtain" })).toBeNull();
  expect(flushPlan({ ...base, pending: false, entering: "online" })).toBeNull();
  expect(flushPlan({ ...base, entering: "online" })).toBe("retry");
});
