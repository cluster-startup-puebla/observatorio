import { expect, it } from "vitest";
import { observatorioCta, portalInviteCta, startupsCta } from "@/content/portal";

it("la portada apunta observatorio a cuenta y el banner a correo", () => {
  expect(observatorioCta.href).toBe("/crear-cuenta?tipo=empresa");
  expect(startupsCta.href).toBe("/sesiones");
  expect(portalInviteCta.href).toContain("mailto:hola@alvarocastillo.dev");
  expect(portalInviteCta.label).toBe("Únete");
});
