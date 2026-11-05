import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isMicrosoftMailbox } from "./microsoft-mailbox";

describe("buzón de Microsoft", () => {
  it("reconoce outlook, hotmail, live y msn con su país", () => {
    expect(isMicrosoftMailbox("ana@outlook.com")).toBe(true);
    expect(isMicrosoftMailbox("ana@outlook.es")).toBe(true);
    expect(isMicrosoftMailbox("ana@hotmail.com.mx")).toBe(true);
    expect(isMicrosoftMailbox("ana@live.com.mx")).toBe(true);
    expect(isMicrosoftMailbox("ana@msn.com")).toBe(true);
  });

  it("un dominio de empresa sigue pidiendo confirmación", () => {
    expect(isMicrosoftMailbox("ana@empresa.mx")).toBe(false);
    expect(isMicrosoftMailbox("ana@gmail.com")).toBe(false);
    expect(isMicrosoftMailbox("ana@outlook.evil.com")).toBe(false);
  });

  it("el registro de empresa y de organismo entra antes de pedir el enlace", () => {
    const empresario = readFileSync("src/lib/auth/signup-empresario.ts", "utf8");
    const organismo = readFileSync("src/lib/organismo/signup-organismo.ts", "utf8");
    expect(empresario.indexOf("!needConfirm || isMicrosoftMailbox")).toBeLessThan(empresario.indexOf("auth.signUp"));
    expect(organismo.indexOf("!needConfirm || isMicrosoftMailbox")).toBeLessThan(organismo.indexOf("auth.signUp"));
    const signIn = readFileSync("src/lib/auth/sign-in.ts", "utf8");
    expect(signIn.indexOf('AUTH_NEED_CONFIRM === "1"')).toBeLessThan(signIn.indexOf("confirm_login_email"));
  });
});
