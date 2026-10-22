import { beforeEach, describe, expect, it } from "vitest";
import { getDirectory, resetDirectory } from "@/lib/memory-directory";

describe("marca con slug", () => {
  beforeEach(() => resetDirectory());

  it("CANACINTRA queda en canacintra", async () => {
    const directory = getDirectory();
    const org = await directory.createAccount({ email: "director@canacintra.mx", role: "director" });
    await directory.completeOnboarding(org.id, {
      sectorSlug: "general",
      size: "organismo",
      name: "CANACINTRA",
      logoKey: "logos/1",
    });
    const account = await directory.getAccount(org.id);
    expect(account?.orgSlug).toBe("canacintra");
  });
});
