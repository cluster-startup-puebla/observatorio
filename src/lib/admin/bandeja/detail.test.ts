import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { retryRow } from "./retry";

describe("detalle de bandeja", () => {
  it("el reintento copia kind y asunto, y no abre correo", () => {
    expect(retryRow({ kind: "event_pass", to_email: "ana@norte.mx", profile_id: "p1", contact_id: null })).toEqual({
      kind: "event_pass",
      to_email: "ana@norte.mx",
      subject: "Tu pase para la sesión ya está listo",
      profile_id: "p1",
      contact_id: null,
    });
    expect(retryRow({ kind: "password", to_email: "ana@norte.mx", profile_id: null, contact_id: "c1" }).subject).toBe(
      "Crea tu contraseña para la sesión",
    );
  });

  it("el handler inserta en outbox_messages", () => {
    const source = readFileSync("src/app/api/admin/bandeja/[id]/route.ts", "utf8");
    expect(source).toContain("await requireSuperadmin()");
    expect(source).toContain("retryRow");
    expect(source).toContain('.from("outbox_messages")');
    expect(source).toContain(".insert(");
    expect(source).not.toContain("smtp");
  });
});
