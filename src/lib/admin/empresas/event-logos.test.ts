import { describe, expect, it } from "vitest";
import { latestShowable, showableLogos, visibleEventLogos } from "./event-logos";

describe("logos del día", () => {
  it("deja fuera a quien no marcó el check o no tiene archivo", () => {
    const rows = visibleEventLogos(
      [
        { id: "c1", legalName: "Norte", profileId: "p1", show: true },
        { id: "c2", legalName: "Sur", profileId: "p2", show: false },
        { id: "c3", legalName: "Centro", profileId: "p3", show: true },
      ],
      [{ profileId: "p1" }],
    );
    expect(rows).toEqual([{ companyId: "c1", name: "Norte", profileId: "p1" }]);
  });

  it("deja los seis más recientes que sí se pueden mostrar", () => {
    const companies = Array.from({ length: 8 }, (_, index) => ({
      id: `c${index}`,
      legalName: `Empresa ${index}`,
      profileId: `p${index}`,
      show: index !== 1,
      createdAt: `2026-11-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`,
    }));
    const assets = companies.filter((company) => company.profileId !== "p2").map((company) => ({ profileId: company.profileId }));
    const rows = latestShowable(companies, assets, 6);
    expect(rows.map((row) => row.companyId)).toEqual(["c7", "c6", "c5", "c4", "c3", "c0"]);
  });

  it("enseña todos y deja al final a quien falta aceptar", () => {
    const rows = showableLogos(
      [
        { id: "nuevo", legalName: "Nuevo", profileId: "p1", show: true, createdAt: "2026-11-12", pending: true },
        { id: "listo", legalName: "Listo", profileId: "p2", show: true, createdAt: "2026-11-10", pending: false },
        { id: "sin-archivo", legalName: "Vacío", profileId: "p3", show: true, createdAt: "2026-11-11", pending: false },
      ],
      [{ profileId: "p1" }, { profileId: "p2" }],
    );
    expect(rows.map((row) => row.companyId)).toEqual(["listo", "nuevo"]);
    expect(rows[1]?.pending).toBe(true);
  });
});
