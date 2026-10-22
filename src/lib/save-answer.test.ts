import { describe, expect, it, vi } from "vitest";
import { saveWithRetry } from "./save-answer";

describe("saveWithRetry", () => {
  it("reintenta una vez y luego conserva el valor", async () => {
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error("red"))
      .mockResolvedValueOnce(undefined);
    const result = await saveWithRetry(save, { personId: "p1", questionId: "1", value: "a" });
    expect(result).toEqual({ ok: true, attempts: 2 });
    expect(save).toHaveBeenCalledTimes(2);
  });

  it("después de dos fallos no dice que quedó guardada", async () => {
    const save = vi.fn().mockRejectedValue(new Error("red"));
    const result = await saveWithRetry(save, { personId: "p1", questionId: "1", value: "a" });
    expect(result).toEqual({ ok: false, attempts: 2 });
  });
});
