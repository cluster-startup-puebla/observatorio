import { describe, expect, it } from "vitest";
import { passWhen } from "./pass-face";

describe("fecha del pase", () => {
  it("formatea la emisión en es-MX y deja vacío lo que no es fecha", () => {
    expect(passWhen("2026-11-13T22:36:28.590Z")).toMatch(/2026/);
    expect(passWhen("")).toBe("");
  });
});
