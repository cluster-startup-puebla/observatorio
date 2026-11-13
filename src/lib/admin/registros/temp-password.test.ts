import { expect, it } from "vitest";
import { temporaryPassword } from "./temp-password";

it("usa la contraseña compartida y cumple el mínimo de 8", () => {
  expect(temporaryPassword).toBe("Observatorio2026!");
  expect(temporaryPassword.length).toBeGreaterThanOrEqual(8);
});
