import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { metodologiaReloadAssignment, metodologiaReloadPlan } from "./metodologia-reload";

const stay = { showNotice: false, redirectTo: null, clearCookie: false };

describe("metodologiaReloadPlan", () => {
  it("sin cookie no redirige y muestra el aviso", () => {
    expect(metodologiaReloadPlan(false, undefined)).toEqual({
      showNotice: true,
      redirectTo: null,
      clearCookie: false,
    });
    expect(metodologiaReloadPlan(false, "")).toEqual({
      showNotice: true,
      redirectTo: null,
      clearCookie: false,
    });
  });

  it("con la cookie redirige a onboarding y la borra", () => {
    expect(metodologiaReloadPlan(false, "1")).toEqual({
      showNotice: false,
      redirectTo: "/onboarding",
      clearCookie: true,
    });
  });

  it("con el evento abierto se queda, haya cookie o no", () => {
    expect(metodologiaReloadPlan(true, undefined)).toEqual(stay);
    expect(metodologiaReloadPlan(true, "1")).toEqual(stay);
  });
});

describe("aviso de recarga en metodología", () => {
  it("deja la cookie en el cliente y el diagnóstico sigue cerrado", () => {
    const page = readFileSync("src/app/metodologia/page.tsx", "utf8");
    const notice = readFileSync("src/app/metodologia/reload-notice.tsx", "utf8");
    const gate = readFileSync("src/lib/auth/metodologia-reload-gate.ts", "utf8");
    const clear = readFileSync("src/app/metodologia/reload/route.ts", "utf8");
    expect(metodologiaReloadAssignment).toBe("metodologia-recarga=1; Path=/; SameSite=Lax");
    expect(page).toContain("prepareMetodologiaReload");
    expect(page).toContain("MetodologiaReloadNotice");
    expect(page).not.toContain("redirectIfEventClosed");
    expect(notice).toContain('toast("Recarga tu página ahora.")');
    expect(notice).toContain("metodologiaReloadAssignment");
    expect(gate).toContain("currentEventOpen");
    expect(gate).toContain('redirect("/metodologia/reload")');
    expect(clear).toContain('new URL("/onboarding", request.url)');
    expect(clear).toContain('maxAge: 0');
    expect(readFileSync("src/app/metodologia/diagnostico/route.ts", "utf8")).toContain(
      "redirectIfEventClosed",
    );
  });
});
