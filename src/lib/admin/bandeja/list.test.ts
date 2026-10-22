import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { outboxRow } from "./kinds";

describe("lista de bandeja", () => {
  it("arma los tres asuntos de la planeación", () => {
    expect(outboxRow("password", "ana@norte.mx")).toEqual({
      kind: "password",
      to_email: "ana@norte.mx",
      subject: "Crea tu contraseña para la sesión",
    });
    expect(outboxRow("event_pass", "ana@norte.mx").subject).toBe("Tu pase para la sesión ya está listo");
    expect(outboxRow("open_innovation", "ana@norte.mx").subject).toBe(
      "¿Quieres ser una empresa de innovación abierta?",
    );
    expect(() => outboxRow("password", " ")).toThrow("correo inválido");
  });

  it("la lista filtra por kind", () => {
    const list = readFileSync("src/lib/admin/bandeja/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/bandeja/route.ts", "utf8");
    expect(list).toContain('.from("outbox_messages")');
    expect(list).toContain("password");
    expect(list).toContain("event_pass");
    expect(list).toContain("open_innovation");
    expect(list).toContain(".range(page.from, page.to)");
    expect(route).toContain("await requireSuperadmin()");
  });
});
