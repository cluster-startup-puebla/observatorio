import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";
import { PassBlock } from "./pass-block";

describe("bloque del pase", () => {
  it("apunta al adjunto cid:pase", async () => {
    const html = await render(<PassBlock />);
    expect(html).toContain("cid:pase");
    expect(html).toContain("En la mesa lo escanean");
  });
});
