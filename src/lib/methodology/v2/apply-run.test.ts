import { expect, it } from "vitest";
import { applyRun } from "./apply-run";
import { memoryRuns, resetMemoryRuns } from "./memory-runs";

const first = {
  instrumentId: "alimentos",
  answers: { "ED-01": { kind: "single" as const, optionValue: "a" } },
  index: 1,
  phase: "general" as const,
  score: null,
  updatedAt: "2026-11-18T15:00:00.000Z",
};

it("el primer envío inserta una fila, marca el arranque y no la cierra", () => {
  resetMemoryRuns();
  const result = applyRun(null, first, "2026-11-18T15:00:01.000Z");
  expect(result.wrote).toBe(true);
  expect(result.row.started_at).toBe("2026-11-18T15:00:01.000Z");
  expect(result.row.finished_at).toBeNull();
  expect(result.row.answers).toEqual(first.answers);
  expect(result.row.score).toBeNull();
  memoryRuns().set("p-1", result.row);
  expect(memoryRuns().size).toBe(1);
});

it("un segundo envío de la misma persona no abre otra fila y no mueve el arranque", () => {
  const current = memoryRuns().get("p-1")!;
  const next = applyRun(
    current,
    {
      ...first,
      answers: { ...first.answers, "ED-02": { kind: "single", optionValue: "b" } },
      index: 20,
      phase: "sector",
      updatedAt: "2026-11-18T15:30:00.000Z",
    },
    "2026-11-18T15:30:01.000Z",
  );
  expect(next.wrote).toBe(true);
  expect(next.row.started_at).toBe(current.started_at);
  expect(next.row.finished_at).toBeNull();
  expect(Object.keys(next.row.answers)).toEqual(["ED-01", "ED-02"]);
  memoryRuns().set("p-1", next.row);
  expect(memoryRuns().size).toBe(1);
});

it("un envío viejo no pisa la fila", () => {
  const current = memoryRuns().get("p-1")!;
  const stale = applyRun(current, { ...first, updatedAt: "2026-11-18T14:00:00.000Z" }, "2026-11-18T16:00:00.000Z");
  expect(stale.wrote).toBe(false);
  expect(stale.row).toBe(current);
});

it("cerrar pone la nota y el cierre, y un envío posterior no los borra", () => {
  const current = memoryRuns().get("p-1")!;
  const done = applyRun(
    current,
    {
      ...first,
      index: 40,
      phase: "done",
      score: { ismsNivel2: 72.5, band: "oro" },
      updatedAt: "2026-11-18T16:00:00.000Z",
    },
    "2026-11-18T16:00:01.000Z",
  );
  expect(done.row.finished_at).toBe("2026-11-18T16:00:01.000Z");
  expect(done.row.score).toEqual({ ismsNivel2: 72.5, band: "oro" });
  const later = applyRun(
    done.row,
    { ...first, phase: "sector", score: null, updatedAt: "2026-11-18T16:10:00.000Z" },
    "2026-11-18T16:10:01.000Z",
  );
  expect(later.row.finished_at).toBe(done.row.finished_at);
  expect(later.row.score).toEqual(done.row.score);
});

it("done sin nota numérica no cuenta como acabado", () => {
  const open = applyRun(null, { ...first, phase: "done", score: null }, "2026-11-18T16:00:01.000Z");
  expect(open.row.finished_at).toBeNull();
});
