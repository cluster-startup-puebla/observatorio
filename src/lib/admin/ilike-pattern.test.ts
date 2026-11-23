import { describe, expect, it } from "vitest";
import { ilikePattern } from "./ilike-pattern";

describe("ilikePattern", () => {
  it("envuelve y escapa comodines", () => {
    expect(ilikePattern("Ana")).toBe("%Ana%");
    expect(ilikePattern("100%")).toBe("%100\\%%");
    expect(ilikePattern("a_b")).toBe("%a\\_b%");
  });
});
