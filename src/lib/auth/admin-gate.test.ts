import { describe, expect, it } from "vitest";
import type { AccountRole } from "@/lib/directory";
import { pathAfterSignIn } from "./home";
import { adminLoginRedirect, adminSignupRedirect, sessionRedirect } from "./session-redirect";

const roles: AccountRole[] = [
  "superadmin",
  "moderador",
  "empresario",
  "director",
  "capturista",
  "invitador",
];
const entries = ["/", "/login", "/register", "/verificar", "/recuperar", "/restablecer"];

describe("adminLoginRedirect y adminSignupRedirect", () => {
  it("abierto: login va a signup y signup se queda", () => {
    const account = { role: "empresario" as const, onboarded: false };
    expect(adminLoginRedirect({ open: true, account: null })).toBe("/admin/signup");
    expect(adminLoginRedirect({ open: true, account })).toBe("/admin/signup");
    expect(adminSignupRedirect({ open: true, account: null })).toBeNull();
    expect(adminSignupRedirect({ open: true, account })).toBeNull();
  });

  it("cerrado sin sesión: signup va a login y login se queda", () => {
    expect(adminSignupRedirect({ open: false, account: null })).toBe("/admin/login");
    expect(adminLoginRedirect({ open: false, account: null })).toBeNull();
  });

  it("cerrado con sesión: el destino es pathAfterSignIn y no cicla", () => {
    for (const role of roles) {
      for (const onboarded of [false, true]) {
        const account = { role, onboarded };
        const dest = adminLoginRedirect({ open: false, account });
        expect(dest).toBe(pathAfterSignIn(account));
        expect(adminSignupRedirect({ open: false, account })).toBe(dest);
        expect(dest).not.toBe("/admin/login");
        expect(dest).not.toBe("/admin/signup");
        expect(entries).not.toContain(dest);
        expect(sessionRedirect({ path: dest ?? "", account })).toBeNull();
      }
    }
  });
});
