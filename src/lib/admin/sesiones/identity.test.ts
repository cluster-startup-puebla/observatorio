import { describe, expect, it } from "vitest";
import { sessionIdentityFromForm } from "./identity";

describe("identidad de sesión", () => {
  it("arma título y slug público", () => {
    const form = new FormData();
    form.set("title", "DISRUPTORS 2026");
    form.set("session_on", "2026-11-28");
    expect(sessionIdentityFromForm(form)).toEqual({
      ok: true,
      title: "DISRUPTORS 2026",
      public_slug: "28-11-26-disruptors-2026",
    });
  });

  it("rechaza título o fecha vacíos", () => {
    expect(sessionIdentityFromForm(new FormData()).ok).toBe(false);
    const form = new FormData();
    form.set("title", "Ok");
    expect(sessionIdentityFromForm(form).ok).toBe(false);
  });
});
