import { describe, expect, it } from "vitest";
import { sentCount } from "./sent-count";

describe("conteo de innovación abierta", () => {
  it("cuenta solo el envío de innovación abierta", () => {
    expect(sentCount([
      { kind: "open_innovation" },
      { kind: "open_innovation" },
      { kind: "password" },
    ])).toBe(2);
  });
});
