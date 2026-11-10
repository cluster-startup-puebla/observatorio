import { describe, expect, it } from "vitest";
import { logoutDestination } from "./logout-door";

describe("logoutDestination", () => {
  it("manda al organismo al inicio", () => {
    expect(logoutDestination("home")).toBe("/");
  });

  it("deja al superadmin en su puerta", () => {
    expect(logoutDestination("admin")).toBe("/admin/login");
  });
});
