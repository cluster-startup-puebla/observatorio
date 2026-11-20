import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("awardLavasForChallengePublish", () => {
  it("exporta el nombre que el plan de retos debe llamar", () => {
    const src = readFileSync("src/lib/lavas/award-challenge-publish.ts", "utf8");
    expect(src).toContain("export async function awardLavasForChallengePublish");
    expect(src).toContain("LAVA_CODES.retoPublicado");
    expect(src).toContain("refKey: input.challengeId");
  });
});
