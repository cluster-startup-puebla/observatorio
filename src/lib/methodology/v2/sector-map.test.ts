import { expect, it } from "vitest";
import { instrumentChoice } from "./sector-map";

it("plásticos abre un solo instrumento", () => {
  expect(instrumentChoice("plasticos-y-hule")).toEqual({ kind: "one", id: "plasticos" });
});

it("textil pregunta hilados o confección", () => {
  expect(instrumentChoice("textil-y-confeccion")).toEqual({
    kind: "pick",
    ids: ["textiles", "confeccion"],
  });
});

it("turismo pregunta hospitalidad o agencias", () => {
  expect(instrumentChoice("turismo")).toEqual({ kind: "pick", ids: ["turismo", "agencias"] });
});

it("minerales no inventa un instrumento", () => {
  expect(instrumentChoice("minerales-no-metalicos")).toEqual({ kind: "none" });
});

it("química y TICs ya tienen instrumento", () => {
  expect(instrumentChoice("quimica")).toEqual({ kind: "one", id: "quimica" });
  expect(instrumentChoice("tecnologia-y-servicios-de-ti")).toEqual({ kind: "one", id: "tics" });
});

it("educación, inmobiliario y servicios financieros usan el instrumento del original", () => {
  expect(instrumentChoice("educacion")).toEqual({ kind: "one", id: "educacion" });
  expect(instrumentChoice("inmobiliario")).toEqual({ kind: "one", id: "inmobiliario" });
  expect(instrumentChoice("servicios-financieros")).toEqual({ kind: "one", id: "sofom" });
});
