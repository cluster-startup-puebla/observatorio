import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("awardLavas", () => {
  it("solo llama al RPC y no calcula monto en el cliente", () => {
    const src = readFileSync("src/lib/lavas/award.ts", "utf8");
    expect(src).toContain('rpc("award_lavas"');
    expect(src).toContain("server-only");
    expect(src).not.toContain("computeLavaAmount");
  });
});
