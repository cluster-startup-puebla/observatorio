import { expect, it } from "vitest";
import { buildReport } from "./report";
import type { V2Question } from "./types";

it("underuse above 40 and a frontier gap above 50 raise the manual signals", () => {
  const questions = [
    question("AU-TECH-02", "single_select", [{ value: "opt1", label: "Poco uso", score: 40 }]),
    question("AU-TECH-03", "single_select", [{ value: "opt1", label: "Atrasado", score: 20 }]),
    question("AU-TECH-06", "single_select", [{ value: "opt1", label: "A mano", score: 25 }]),
    question("AU-TECH-07", "single_select", [{ value: "opt1", label: "En papel", score: 25 }]),
  ];
  const answers = {
    "AU-TECH-02": { kind: "single" as const, optionValue: "opt1" },
    "AU-TECH-03": { kind: "single" as const, optionValue: "opt1" },
    "AU-TECH-06": { kind: "single" as const, optionValue: "opt1" },
    "AU-TECH-07": { kind: "single" as const, optionValue: "opt1" },
  };
  const report = buildReport(questions, answers, 12);
  expect(report.underuse?.idle).toBe(60);
  expect(report.underuse?.adornment).toBe(true);
  expect(report.frontier?.delta).toBe(80);
  expect(report.frontier?.behind).toBe(true);
  expect(report.gapZone).toBe("Falsa complacencia");
  expect(report.signals.length).toBe(4);
});

function question(id: string, type: V2Question["type"], options: V2Question["options"]): V2Question {
  return {
    id,
    level: "n2",
    sectorId: "automotriz",
    section: "II",
    widget: "single",
    title: id,
    prompt: id,
    microcopy: null,
    type,
    prefilled: false,
    options,
  };
}
