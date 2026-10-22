import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { openNewOrg, signUpSuperadmin } from "./admin-session";

test.beforeEach(async ({ request }) => {
  expect((await request.post("/test/reset")).ok()).toBeTruthy();
});

test("un organismo inválido no se crea", async ({ page }) => {
  await signUpSuperadmin(page);
  await openNewOrg(page);
  await page.getByLabel("Nombre").fill("A");
  await page.getByRole("button", { name: "Crear organismo" }).click();
  await expect(page.getByText("nombre inválido")).toBeVisible();
  await expect(page.getByLabel("Nombre")).toHaveValue("A");

  const dir = await mkdtemp(join(tmpdir(), "org-"));
  await writeFile(join(dir, "nota.txt"), "no es imagen");
  await writeFile(join(dir, "grande.png"), Buffer.alloc(2_097_153));
  await page.getByLabel("Nombre").fill("CANACINTRA");
  await page.getByLabel("Color").fill("#16284F");
  await page.getByLabel("Logo").setInputFiles(join(dir, "nota.txt"));
  await page.getByRole("button", { name: "Crear organismo" }).click();
  await expect(page.getByText("tipo de imagen no permitido")).toBeVisible();

  await page.getByLabel("Nombre").fill("CANACINTRA");
  await page.getByLabel("Color").fill("#16284F");
  await page.getByLabel("Logo").setInputFiles(join(dir, "grande.png"));
  await page.getByRole("button", { name: "Crear organismo" }).click();
  await expect(page.getByText("pasa de 2 MB")).toBeVisible();
  await expect(page.getByRole("cell", { name: "CANACINTRA" })).toHaveCount(0);
});
