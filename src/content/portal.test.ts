import { expect, it } from "vitest";
import { observatorioCta, portalInviteCtas, startupsCta } from "@/content/portal";

it("la portada apunta observatorio a cuenta y el banner a los dos registros", () => {
  expect(observatorioCta.href).toBe("/crear-cuenta?tipo=empresa");
  expect(startupsCta.href).toBe("/sesiones");
  expect(portalInviteCtas.map((cta) => cta.label)).toEqual(["Soy un org empresarial", "Soy empresa"]);
  expect(portalInviteCtas[0].href).toBe("/crear-cuenta?cuenta=organismo");
  expect(portalInviteCtas[1].href).toBe("/crear-cuenta");
});
