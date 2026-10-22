import { describe, expect, it } from "vitest";
import { accessQrDataUrl } from "./access-qr";

describe("qr de acceso", () => {
  it("genera un png del código", async () => {
    const url = await accessQrDataUrl("persona-registrada");
    expect(url.startsWith("data:image/png;base64,")).toBe(true);
  });
});
