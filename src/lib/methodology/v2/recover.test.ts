import { expect, it } from "vitest";
import { pickDraft } from "./recover";
import type { V2Draft } from "./draft";

function draft(answers: V2Draft["answers"], updatedAt: string): V2Draft {
  return { instrumentId: "alimentos", answers, index: 0, phase: "general", updatedAt, sentAt: null };
}

it("gana el que trae más respuestas", () => {
  const local = draft({ a: { kind: "single", optionValue: "1" } }, "2026-11-18T15:00:00.000Z");
  const remote = draft({}, "2026-11-18T16:00:00.000Z");
  expect(pickDraft(local, remote)).toBe(local);
});

it("a igual número de respuestas gana el más nuevo", () => {
  const local = draft({ a: { kind: "single", optionValue: "1" } }, "2026-11-18T14:00:00.000Z");
  const remote = draft({ a: { kind: "single", optionValue: "2" } }, "2026-11-18T15:00:00.000Z");
  expect(pickDraft(local, remote)).toBe(remote);
});

it("sin copia local usa la del servidor", () => {
  const remote = draft({ a: { kind: "single", optionValue: "1" } }, "2026-11-18T15:00:00.000Z");
  expect(pickDraft(null, remote)).toBe(remote);
});
