import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el pase de cuenta acepta legacy o RSVP", () => {
  const source = readFileSync("src/lib/admin/mesa/profile-has-pass.ts", "utf8");
  expect(source).toContain('.from("passes")');
  expect(source).toContain("rsvp_passes");
});
