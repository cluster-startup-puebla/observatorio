import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { AccountRole } from "@/lib/directory";
import { pathAfterSignIn } from "./home";
import { sessionRedirect } from "./session-redirect";

const roles: AccountRole[] = [
  "superadmin",
  "moderador",
  "empresario",
  "director",
  "capturista",
  "invitador",
];
const entries = ["/", "/login", "/register", "/verificar", "/recuperar", "/restablecer"];
const stayed = [
  "/onboarding",
  "/metodologia",
  "/organismo",
  "/admin",
  "/admin/mesa",
  "/admin/login",
  "/admin/signup",
  "/turismo",
  "/canacintra",
];

describe("sessionRedirect", () => {
  it("sin cuenta no redirige", () => {
    for (const path of entries) expect(sessionRedirect({ path, account: null })).toBeNull();
  });

  it("delega en pathAfterSignIn y la segunda llamada se detiene", () => {
    for (const path of entries) {
      for (const role of roles) {
        for (const onboarded of [false, true]) {
          const account = { role, onboarded };
          const dest = sessionRedirect({ path, account });
          expect(dest).toBe(pathAfterSignIn(account));
          expect(entries).not.toContain(dest);
          expect(sessionRedirect({ path: dest ?? "", account })).toBeNull();
        }
      }
    }
  });

  it("un destino, una puerta de admin o una landing no es entrada", () => {
    const account = { role: "empresario" as const, onboarded: false };
    for (const path of stayed) expect(sessionRedirect({ path, account })).toBeNull();
  });

  it("no copia la regla del empresario y no toca el layout ni los destinos", () => {
    const gate = readFileSync("src/lib/auth/session-redirect.ts", "utf8");
    expect(gate).toContain("pathAfterSignIn");
    expect(gate).not.toContain("empresario");
    expect(readFileSync("src/lib/auth/home.ts", "utf8")).toContain(
      'if (input.role === "empresario" && (!input.onboarded || input.awaitingApproval)) return "/onboarding"',
    );
    const files = [
      "src/app/layout.tsx",
      "src/app/onboarding/page.tsx",
      "src/app/onboarding/supabase-screen.tsx",
      "src/app/metodologia/page.tsx",
      "src/app/organismo/page.tsx",
      "src/app/admin/page.tsx",
      "src/app/admin/layout.tsx",
      "src/app/[sector]/page.tsx",
    ];
    for (const file of files) expect(readFileSync(file, "utf8")).not.toContain("redirectIfSession");
  });
});
