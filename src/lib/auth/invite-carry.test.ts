import { describe, expect, it } from "vitest";
import { inviteFromMetadata, inviteMetadata, withInvite } from "./invite-carry";

describe("invite carry", () => {
  it("guarda el sector y la invitación en la cuenta", () => {
    expect(inviteMetadata("plasticos-y-hule", "abc")).toEqual({
      intent: "empresario",
      sector: "plasticos-y-hule",
      invitacion: "abc",
    });
    expect(inviteMetadata("", "")).toEqual({ intent: "empresario" });
  });

  it("los recupera después del correo", () => {
    expect(inviteFromMetadata({ intent: "empresario", sector: "plasticos-y-hule", invitacion: " abc " })).toEqual({
      sector: "plasticos-y-hule",
      invite: "abc",
    });
    expect(inviteFromMetadata(null)).toEqual({ sector: "", invite: "" });
  });

  it("solo los pone en onboarding", () => {
    expect(withInvite("/onboarding", { sector: "plasticos-y-hule", invite: "abc" })).toBe(
      "/onboarding?sector=plasticos-y-hule&invitacion=abc",
    );
    expect(withInvite("/metodologia", { sector: "plasticos-y-hule", invite: "abc" })).toBe("/metodologia");
  });
});
