import { describe, expect, it } from "vitest";

describe("arnés", () => {
  it("corre vitest", () => {
    expect(1 + 1).toBe(2);
  });

  it("un caso que no cuadra sigue fallando la expectativa", () => {
    expect(1 + 1).not.toBe(3);
  });
});
