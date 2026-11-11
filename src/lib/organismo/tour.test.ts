import { describe, expect, it } from "vitest";
import { sessionCopy, tourStart, tourSteps } from "./tour";

describe("tour del organismo", () => {
  it("la primera vez empieza en el inicio", () => {
    expect(tourStart({ path: "/canirac-puebla", tour: false, seen: false })).toBe("home");
  });

  it("no vuelve a salir si ya se vio", () => {
    expect(tourStart({ path: "/canirac-puebla", tour: false, seen: true })).toBeNull();
    expect(tourStart({ path: "/canirac-puebla/crm", tour: true, seen: true })).toBeNull();
  });

  it("el CRM solo habla cuando el inicio lo abrió", () => {
    expect(tourStart({ path: "/canirac-puebla/crm", tour: true, seen: false })).toBe("crm");
    expect(tourStart({ path: "/canirac-puebla/crm", tour: false, seen: false })).toBeNull();
  });

  it("con una sesión dice que es la única", () => {
    expect(sessionCopy(1)).toMatch(/una sola/);
    expect(sessionCopy(2)).not.toMatch(/una sola/);
  });

  it("el inicio no pide generar y el CRM señala la tabla", () => {
    expect(tourSteps("home", 1).map((step) => step.element)).toEqual(["sector", "sesion"]);
    expect(tourSteps("home", 1)[0]?.description).toMatch(/invitas a todos/);
    expect(tourSteps("crm", 0).map((step) => step.element)).toEqual(["crm"]);
    expect(tourSteps("crm", 0)[0]?.description).toMatch(/esta tabla/);
  });

  it("sin sesiones no señala la sesión", () => {
    expect(tourSteps("home", 0).map((step) => step.element)).toEqual(["sector"]);
  });
});
