import { describe, expect, it } from "vitest";
import { signupErrorCode } from "@/lib/organismo/signup-back";
import { confirmEmailRedirect, resendConfirmationResult, unconfirmedSignup, verifyEmailPath } from "./confirm-email";

describe("confirmación de correo", () => {
  it("reconoce el rechazo de supabase", () => {
    expect(signupErrorCode("Email not confirmed")).toBe("confirmar");
  });

  it("arma el regreso al login y la pantalla de reenvío", () => {
    expect(confirmEmailRedirect("https://observatorio.clusterdestartups.org/")).toBe(
      "https://observatorio.clusterdestartups.org/login?aviso=confirmado",
    );
    expect(confirmEmailRedirect("")).toBeUndefined();
    expect(verifyEmailPath({ email: "ana@empresa.mx", sector: "alimentos" })).toBe(
      "/verificar?correo=ana%40empresa.mx&sector=alimentos",
    );
  });

  it("sin sesión confirmada manda a verificar, no a un error genérico", () => {
    expect(unconfirmedSignup({ needConfirm: false, signInError: "Email not confirmed", gotSession: false })).toBe(
      "verificar",
    );
    expect(unconfirmedSignup({ needConfirm: true, signInError: null, gotSession: false })).toBe("verificar");
    expect(unconfirmedSignup({ needConfirm: false, signInError: "invalid", gotSession: false })).toBe("auth");
    expect(unconfirmedSignup({ needConfirm: false, signInError: null, gotSession: true })).toBe("session");
  });

  it("el reenvío no revela si el correo existe", () => {
    expect(resendConfirmationResult(null)).toBe("ok");
    expect(resendConfirmationResult("User not found")).toBe("ok");
    expect(resendConfirmationResult("email rate limit exceeded")).toBe("limite");
  });
});
