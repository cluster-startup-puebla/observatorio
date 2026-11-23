import { expect, it } from "vitest";
import { companySessionOrFilter } from "./company-session-filter";

it("nunca mezcla filas sin session_id", () => {
  expect(companySessionOrFilter({ id: "a", is_current: true })).toBeNull();
  expect(companySessionOrFilter({ id: "b", is_current: false })).toBeNull();
});
