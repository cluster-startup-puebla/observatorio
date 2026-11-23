import { expect, it } from "vitest";
import { sessionReserveHref } from "./disruptors-reserve";

it("Disruptors manda a /registro; Puebla sigue en crear-cuenta", () => {
  expect(sessionReserveHref("28-11-26-disruptors-2026", "turismo", "tok")).toBe(
    "/registro?sector=turismo&invitacion=tok",
  );
  expect(sessionReserveHref("18-11-26-arranque-puebla-x-puebla", "turismo", "tok")).toContain(
    "/crear-cuenta?",
  );
});
