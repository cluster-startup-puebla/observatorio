import { expect, it } from "vitest";
import { stepOneIssue } from "./step-one";

it("acepta nombre, puesto y correo", () => {
  expect(stepOneIssue({
    fullName: "Ana",
    jobTitle: "Directora",
    email: "ana@empresa.mx",
    whatsapp: "",
  })).toBeNull();
});

it("rechaza un correo sin arroba y un nombre de una letra", () => {
  expect(stepOneIssue({
    fullName: "A",
    jobTitle: "Directora",
    email: "ana",
    whatsapp: "123",
  })).toBe("nombre");
});
