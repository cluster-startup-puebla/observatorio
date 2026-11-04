import { describe, expect, it } from "vitest";
import { passQrAttachment } from "./pass-qr";

describe("png del pase", () => {
  it("codifica el id del perfil y lo marca como cid", async () => {
    const file = await passQrAttachment("360ab36d-9882-44c6-9b61-1010b9aab795");
    expect(file.contentId).toBe("pase");
    expect(file.contentType).toBe("image/png");
    expect(file.filename).toBe("pase.png");
    expect(Buffer.from(file.content, "base64").subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  });

  it("rechaza un código vacío", async () => {
    await expect(passQrAttachment("  ")).rejects.toThrow("sin pase");
  });
});
