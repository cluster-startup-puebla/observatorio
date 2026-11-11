import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { continueHref } from "./continue-href";

describe("envío propio", () => {
  it("arma el enlace de inicio de sesión", () => {
    expect(continueHref("https://observatorio.example")).toBe("https://observatorio.example/login");
    expect(continueHref(undefined)).toBe("https://observatorio.clusterdestartups.org/login");
  });

  it("el alta manda bienvenida y la confirmación guarda el pase", () => {
    const send = readFileSync("src/lib/mail/send-own.ts", "utf8");
    const signup = readFileSync("src/lib/auth/signup-empresario.ts", "utf8");
    const done = readFileSync("src/lib/onboarding/complete-empresario.ts", "utf8");
    const issue = readFileSync("src/lib/onboarding/issue-confirmed-pass.ts", "utf8");
    const screen = readFileSync("src/app/onboarding/supabase-screen.tsx", "utf8");
    const store = readFileSync("src/lib/onboarding/store-pass.ts", "utf8");
    expect(send).toContain("enqueue_own_mail");
    expect(send).toContain("record_own_mail");
    expect(send).toContain("paintMail");
    expect(send).toContain("already_sent");
    expect(signup).toContain("sendOwnMail");
    expect(signup).toContain('"welcome"');
    expect(done).toContain("issueConfirmedPass");
    expect(screen).toContain("issueConfirmedPass");
    expect(issue).toContain("storePass");
    expect(issue).toContain("sendOwnMail");
    expect(issue).toContain('"event_pass"');
    expect(issue).toContain("linkPassPending");
    expect(store).toContain("pass-images");
    expect(store).toContain("pass_qr");
    expect(store).toContain('.from("passes")');
  });
});
