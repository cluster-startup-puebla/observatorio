import { beforeEach, describe, expect, it } from "vitest";
import { getDirectory, resetDirectory } from "@/lib/memory-directory";

describe("aperturas", () => {
  beforeEach(() => resetDirectory());

  it("una visita válida suma y un token roto no", async () => {
    const directory = getDirectory();
    const org = await directory.createAccount({ email: "dir@camara.mx", role: "director" });
    await directory.completeOnboarding(org.id, {
      sectorSlug: "general",
      size: "organismo",
      name: "Cámara",
      logoKey: "logos/1",
    });
    const token = await directory.copyEventLink(org.id, "turismo");
    await directory.recordOpen({ token, sectorSlug: "turismo", at: "2026-10-22T15:00:00.000Z" });
    await directory.recordOpen({ token: `${token}x`, sectorSlug: "turismo", at: "2026-10-22T15:00:00.000Z" });
    const opens = await directory.opensFor(org.id);
    expect(opens).toEqual([{ at: "2026-10-22T15:00:00.000Z" }]);
  });
});
