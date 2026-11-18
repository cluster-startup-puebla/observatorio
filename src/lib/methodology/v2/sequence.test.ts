import { expect, it } from "vitest";
import n1 from "@/content/methodology/v2/n1.json";
import automotriz from "@/content/methodology/v2/n2/automotriz.json";
import { complete } from "./complete";
import { sessionQuestions } from "./sequence";
import type { V2Question } from "./types";

it("automotriz contesta 21 generales y sus 19", () => {
  const questions = sessionQuestions(
    n1.questions as V2Question[],
    automotriz.questions as V2Question[],
    "MOD0-WEB-01",
  );
  expect(questions.filter((question) => question.level === "n1")).toHaveLength(21);
  expect(questions.filter((question) => question.level === "n2")).toHaveLength(19);
  expect(questions.some((question) => question.id === "MOD0-WEB-01")).toBe(false);
});

it("un ranking incompleto no deja continuar", () => {
  const question = {
    id: "R",
    level: "n1",
    sectorId: null,
    section: "s",
    widget: "w",
    title: "t",
    prompt: "p",
    microcopy: null,
    type: "rank",
    prefilled: false,
    factors: [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
    ],
  } as V2Question;
  expect(complete(question, { kind: "rank", ranks: { a: 1 } })).toBe(false);
  expect(complete(question, { kind: "rank", ranks: { a: 1, b: 2 } })).toBe(true);
});
