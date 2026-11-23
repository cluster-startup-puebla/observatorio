import { expect, it } from "vitest";
import { isOrgPanelPath } from "./panel-path";

it("cubre panel legacy y panel bajo /sesiones", () => {
  expect(isOrgPanelPath("/cluster-chignahuapan-zacatlan-puebla/crm", "cluster-chignahuapan-zacatlan-puebla")).toBe(true);
  expect(
    isOrgPanelPath(
      "/sesiones/28-11-26-disruptors-2026/cluster-chignahuapan-zacatlan-puebla/crm",
      "cluster-chignahuapan-zacatlan-puebla",
    ),
  ).toBe(true);
  expect(isOrgPanelPath("/sesiones/28-11-26-disruptors-2026", "cluster-chignahuapan-zacatlan-puebla")).toBe(false);
  expect(isOrgPanelPath("/sesiones/x/otro-org/crm", "cluster-chignahuapan-zacatlan-puebla")).toBe(false);
  expect(isOrgPanelPath("/admin/crm", "cluster-chignahuapan-zacatlan-puebla")).toBe(false);
});
