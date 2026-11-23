import { describe, expect, it } from "vitest";
import { loadRegistroSessionId, resolveRegistroSession } from "./resolve-session";

describe("resolveRegistroSession", () => {
  it("prioriza ?sesion= y si no usa slug disruptors", () => {
    expect(resolveRegistroSession({ queryId: "47304bdd-2bd1-48e8-ad7b-a0f484ae5cb3" })).toEqual({
      kind: "id",
      id: "47304bdd-2bd1-48e8-ad7b-a0f484ae5cb3",
    });
    expect(resolveRegistroSession({}).slug).toBe("28-11-26-disruptors-2026");
  });

  it("resuelve el uuid por slug", async () => {
    const id = await loadRegistroSessionId({
      lookup: async (slug) => (slug === "28-11-26-disruptors-2026" ? "sess-1" : null),
    });
    expect(id).toBe("sess-1");
  });
});
