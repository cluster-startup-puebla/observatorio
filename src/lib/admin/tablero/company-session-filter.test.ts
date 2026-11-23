import { expect, it } from "vitest";
import { companySessionOrFilter } from "./company-session-filter";

it("la sesión vigente incluye filas sin session_id", () => {
  expect(companySessionOrFilter({ id: "a", is_current: true })).toBe("session_id.eq.a,session_id.is.null");
  expect(companySessionOrFilter({ id: "b", is_current: false })).toBeNull();
});
