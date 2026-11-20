import { describe, expect, it } from "vitest";
import { companyActions } from "./company-actions";

const sessionHref = "/app/sesiones/18-11-26-arranque";

describe("companyActions", () => {
  it("arma las cuatro acciones en orden", () => {
    expect(
      companyActions({ gaps: ["logo", "website"], showEvaluation: true, sessionHref }),
    ).toEqual([
      { label: "Sube el logo de tu empresa", href: "/app/home" },
      { label: "Agrega el sitio web", href: "/app/home" },
      { label: "Realiza tu primera evaluación", href: "/metodologia" },
      { label: "Unirme a la sesión", href: sessionHref },
    ]);
  });

  it("mantiene el orden aunque los huecos lleguen al revés", () => {
    expect(
      companyActions({ gaps: ["website", "logo"], showEvaluation: false, sessionHref: null }),
    ).toEqual([
      { label: "Sube el logo de tu empresa", href: "/app/home" },
      { label: "Agrega el sitio web", href: "/app/home" },
    ]);
  });

  it("incluye solo el logo", () => {
    expect(companyActions({ gaps: ["logo"], showEvaluation: false, sessionHref: "" })).toEqual([
      { label: "Sube el logo de tu empresa", href: "/app/home" },
    ]);
  });

  it("incluye solo el sitio web", () => {
    expect(companyActions({ gaps: ["website"], showEvaluation: false, sessionHref: null })).toEqual([
      { label: "Agrega el sitio web", href: "/app/home" },
    ]);
  });

  it("incluye solo la evaluación", () => {
    expect(companyActions({ gaps: [], showEvaluation: true, sessionHref: null })).toEqual([
      { label: "Realiza tu primera evaluación", href: "/metodologia" },
    ]);
  });

  it("incluye la sesión solo cuando el enlace tiene texto", () => {
    expect(companyActions({ gaps: [], showEvaluation: false, sessionHref })).toEqual([
      { label: "Unirme a la sesión", href: sessionHref },
    ]);
    expect(companyActions({ gaps: [], showEvaluation: false, sessionHref: "" })).toEqual([]);
    expect(companyActions({ gaps: [], showEvaluation: false, sessionHref: null })).toEqual([]);
  });

  it("deja la evaluación fuera y conserva lo que sigue", () => {
    expect(companyActions({ gaps: ["website"], showEvaluation: false, sessionHref })).toEqual([
      { label: "Agrega el sitio web", href: "/app/home" },
      { label: "Unirme a la sesión", href: sessionHref },
    ]);
  });

  it("devuelve una lista vacía cuando nada aplica", () => {
    expect(companyActions({ gaps: [], showEvaluation: false, sessionHref: null })).toEqual([]);
  });
});
