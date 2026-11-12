import { describe, expect, it } from "vitest";
import { memberRoleLabel } from "./member-label";

describe("rol del miembro", () => {
  it("dice el rol en español", () => {
    expect(memberRoleLabel("director")).toBe("Director");
    expect(memberRoleLabel("capturista")).toBe("Capturista");
    expect(memberRoleLabel("invitador")).toBe("Invitador");
  });
});
