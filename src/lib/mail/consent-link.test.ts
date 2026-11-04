import { describe, expect, it } from "vitest";
import { ensureConsentToken, newConsentToken } from "./consent-link";

const profileId = "360ab36d-9882-44c6-9b61-1010b9aab795";

function fakeDb(state: { token: string | null }) {
  return {
    from(table: string) {
      if (table !== "innovation_consents") throw new Error(table);
      return {
        select() {
          return {
            eq() {
              return {
                maybeSingle: async () => ({
                  data: state.token ? { token: state.token } : null,
                  error: null,
                }),
              };
            },
          };
        },
        insert(row: { profile_id: string; token: string }) {
          if (row.profile_id !== profileId) return Promise.resolve({ error: { message: "perfil" } });
          state.token = row.token;
          return Promise.resolve({ error: null });
        },
      };
    },
  };
}

describe("enlace de innovaci\u00f3n abierta", () => {
  it("crea un token opaco y lo reutiliza", async () => {
    const state: { token: string | null } = { token: null };
    const db = fakeDb(state);
    const first = await ensureConsentToken(db, profileId, "https://observatorio.example/");
    const second = await ensureConsentToken(db, profileId, "https://observatorio.example");
    expect(first).toBe(second);
    expect(first).toContain("https://observatorio.example/innovacion-abierta/aceptar?t=");
    expect(state.token).toMatch(/^[A-Za-z0-9_-]{43,80}$/);
    expect(first).toContain(encodeURIComponent(state.token ?? ""));
    expect(newConsentToken()).not.toBe(newConsentToken());
  });

  it("sin sitio no guarda token", async () => {
    const state: { token: string | null } = { token: null };
    const href = await ensureConsentToken(fakeDb(state), profileId, "  ");
    expect(href).toBeNull();
    expect(state.token).toBeNull();
  });
});
