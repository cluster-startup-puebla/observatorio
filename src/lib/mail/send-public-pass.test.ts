import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const source = readFileSync("src/lib/mail/send-public-pass.ts", "utf8");

it("manda el pase y deja fuera la contraseña", () => {
  expect(source).toContain('rpc("enqueue_public_pass"');
  expect(source).toContain("writePass");
  expect(source).toContain('kind: "event_pass"');
  expect(source).toContain('rpc("record_accepted_pass"');
  expect(source).not.toContain("temporaryPassword");
  expect(source).not.toContain("Observatorio2026");
});
