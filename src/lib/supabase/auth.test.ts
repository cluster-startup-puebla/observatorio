import { describe, expect, it } from "vitest";
import { roleForSignup } from "./auth";

describe("roleForSignup", () => {
  it("el alta pública solo puede ser empresario o director", () => {
    expect(roleForSignup("empresario")).toBe("empresario");
    expect(roleForSignup("director")).toBe("director");
    expect(roleForSignup("superadmin")).toBe("empresario");
    expect(roleForSignup("moderador")).toBe("empresario");
    expect(roleForSignup("capturista")).toBe("empresario");
    expect(roleForSignup("invitador")).toBe("empresario");
  });
});
