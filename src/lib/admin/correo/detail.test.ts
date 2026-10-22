import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { innovationDetail } from "./detail";

describe("detalle del correo masivo", () => {
  it("solo abre un mensaje de innovación abierta con su asunto", () => {
    expect(innovationDetail({
      kind: "open_innovation",
      subject: "¿Quieres ser una empresa de innovación abierta?",
      to_email: "ana@norte.mx",
    })).toEqual({
      to: "ana@norte.mx",
      subject: "¿Quieres ser una empresa de innovación abierta?",
    });
    expect(innovationDetail({ kind: "password", subject: "Crea tu contraseña para la sesión", to_email: "ana@norte.mx" })).toBeNull();
    expect(innovationDetail(null)).toBeNull();
  });

  it("el handler exige superadmin", () => {
    const source = readFileSync("src/app/api/admin/correo/[id]/route.ts", "utf8");
    expect(source).toContain("await requireSuperadmin()");
    expect(source).toContain("innovationDetail");
    expect(source).not.toMatch(/export async function POST/);
  });
});
