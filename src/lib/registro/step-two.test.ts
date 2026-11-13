import { expect, it } from "vitest";
import { stepTwoIssue } from "./step-two";

const ready = {
  companyName: "Norte",
  marketSize: "local",
  employeeBand: "1\u201310",
  municipality: "Puebla",
  sectorSlug: "alimentos-y-bebidas",
  referralSource: "Un organismo",
  sessionInterest: "Ver el diagn\u00f3stico",
  terms: true,
};

it("el paso 2 no pide logo", () => {
  expect(stepTwoIssue(ready)).toBeNull();
  expect(stepTwoIssue({ ...ready, terms: false })).toBe("terminos");
});

it("un inter\u00e9s vac\u00edo no cierra", () => {
  expect(stepTwoIssue({ ...ready, sessionInterest: "" })).toBe("interes");
});
