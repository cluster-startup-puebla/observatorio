import { describe, expect, it } from "vitest";
import { eventToken } from "./event-token";
import { boundSessionId, invitePath } from "./invite-path";

const sessionA = "a23efe9d-0067-4b64-a3a2-6d3d7d3ef8af";
const sessionB = "b23efe9d-0067-4b64-a3a2-6d3d7d3ef8af";

describe("enlace con sesión", () => {
  it("deja el token como llave y la sesión en sesion", () => {
    const token = "abc.def_TOKEN";
    const path = invitePath("turismo", token, sessionA);
    expect(path).toBe(`/turismo?${token}&sesion=${sessionA}`);
    expect(path.split("?")[1]?.split("&")[0]).toBe(token);
    const params = new URLSearchParams(path.slice(path.indexOf("?") + 1));
    const bag: Record<string, string> = {};
    params.forEach((value, key) => {
      bag[key] = value;
    });
    expect(eventToken(bag)).toBe(token);
    expect(bag.sesion).toBe(sessionA);
    expect(token.includes("sesion")).toBe(false);
  });

  it("sin sesión no agrega el parámetro", () => {
    expect(invitePath("turismo", "abc", null)).toBe("/turismo?abc");
    expect(invitePath("turismo", "abc")).toBe("/turismo?abc");
  });

  it("no confunde sesion con el token aunque venga primero", () => {
    expect(eventToken({ sesion: sessionA, "abc.def": "" })).toBe("abc.def");
    expect(eventToken({ sesion: sessionA })).toBeNull();
  });

  it("con una vigente usa esa y con dos exige la elegida", () => {
    expect(boundSessionId("", [])).toEqual({ ok: true, sessionId: null });
    expect(boundSessionId("", [sessionA])).toEqual({ ok: true, sessionId: sessionA });
    expect(boundSessionId(sessionA, [sessionA, sessionB])).toEqual({ ok: true, sessionId: sessionA });
    expect(boundSessionId("", [sessionA, sessionB]).ok).toBe(false);
    expect(boundSessionId("otra", [sessionA, sessionB]).ok).toBe(false);
  });
});
