import { describe, expect, it } from "vitest";
import { confirmedSinCuenta } from "./confirmed-sin-cuenta";

describe("confirmedSinCuenta", () => {
  it("solo confirmed sin profile_id", () => {
    expect(
      confirmedSinCuenta([
        { status: "confirmed", profile_id: null },
        { status: "confirmed", profile_id: "p1" },
        { status: "pending", profile_id: null },
      ]),
    ).toBe(1);
  });
});