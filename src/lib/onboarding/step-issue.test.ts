import { describe, expect, it } from "vitest";
import { emptyEmpresarioValues } from "./empresario-steps";
import { serverIssue, stepIssue } from "./step-issue";

const valid = {
  ...emptyEmpresarioValues("turismo"),
  fullName: "Ana López",
  jobTitle: "Directora",
  whatsapp: "2221234567",
  companyName: "Taller Norte",
  marketSize: "regional",
  employeeBand: "11–50",
  municipality: "Puebla",
  sectorSlug: "turismo",
  referralSource: "Clúster",
  sessionInterest: "Proveedores",
  showLogo: false,
  hasLogo: false,
};

describe("aviso del paso", () => {
  it("un WhatsApp de 20 dígitos dice el rango", () => {
    expect(stepIssue(0, { ...valid, whatsapp: "28504976986068664664" })).toBe(
      "El WhatsApp lleva de 10 a 15 dígitos, o déjalo vacío.",
    );
  });

  it("el WhatsApp vacío deja pasar el paso", () => {
    expect(stepIssue(0, { ...valid, whatsapp: "" })).toBeNull();
  });

  it("el código del servidor no se esconde detrás de una frase genérica", () => {
    expect(serverIssue("whatsapp")).toBe(
      "El WhatsApp lleva de 10 a 15 dígitos, o déjalo vacío.",
    );
    expect(serverIssue("logo")).toBe("Sube un logo PNG, JPG o WEBP de hasta 2 MB.");
  });
});
