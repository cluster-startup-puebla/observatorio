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

it("rechaza un puesto de una letra", () => {
  expect(stepOneIssue({
    fullName: "Ana",
    jobTitle: "D",
    email: "ana@empresa.mx",
    whatsapp: "",
  })).toBe("puesto");
});

it("rechaza un correo sin arroba", () => {
  expect(stepOneIssue({
    fullName: "Ana",
    jobTitle: "Directora",
    email: "ana",
    whatsapp: "",
  })).toBe("correo");
});

it("rechaza un whatsapp de tres dígitos", () => {
  expect(stepOneIssue({
    fullName: "Ana",
    jobTitle: "Directora",
    email: "ana@empresa.mx",
    whatsapp: "123",
  })).toBe("whatsapp");
});

it("rechaza un whatsapp de 16 dígitos", () => {
  expect(stepOneIssue({
    fullName: "Ana",
    jobTitle: "Directora",
    email: "ana@empresa.mx",
    whatsapp: "1234567890123456",
  })).toBe("whatsapp");
});

it("acepta un whatsapp de 10 dígitos", () => {
  expect(stepOneIssue({
    fullName: "Ana",
    jobTitle: "Directora",
    email: "ana@empresa.mx",
    whatsapp: "5512345678",
  })).toBeNull();
});
