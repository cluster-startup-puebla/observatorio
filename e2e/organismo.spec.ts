import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { openNewOrg, signUpSuperadmin } from "./admin-session";

const logo = join(process.cwd(), "e2e/fixtures/coparmex-puebla.png");

test.beforeEach(async ({ request }) => {
  expect((await request.post("/test/reset")).ok()).toBeTruthy();
});

test("alta, edición y baja de Coparmex Puebla", async ({ page }) => {
  await signUpSuperadmin(page);
  await openNewOrg(page);
  await page.getByLabel("Nombre").fill("Coparmex Puebla");
  await page.getByLabel("Color").fill("#003399");
  await page.getByLabel("Logo").setInputFiles(logo);
  await expect(page.getByAltText("Vista previa del logo")).toBeVisible();
  await page.getByRole("button", { name: "Crear organismo" }).click();

  await expect(page.getByRole("heading", { name: "Coparmex Puebla" })).toBeVisible();
  await expect(page.getByText("Lista")).toBeVisible();
  const image = page.getByAltText("Logo de Coparmex Puebla");
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(0);
  const detail = page.url();

  await page.goto("/admin/organismos");
  await page.getByRole("button", { name: "Editar" }).click();
  await page.getByLabel("Nombre").fill("A");
  await page.getByRole("button", { name: "Guardar organismo" }).click();
  await expect(page.getByText("nombre inválido")).toBeVisible();
  await expect(page.getByLabel("Nombre")).toHaveValue("A");

  await page.getByLabel("Nombre").fill("Coparmex Puebla A.C.");
  await page.getByLabel("Color").fill("#1B3A5C");
  await page.getByRole("button", { name: "Guardar organismo" }).click();
  await expect(page.getByRole("heading", { name: "Coparmex Puebla A.C." })).toBeVisible();
  await expect(page.getByAltText("Logo de Coparmex Puebla A.C.")).toBeVisible();

  await page.goto("/admin/organismos");
  await expect(page.getByRole("cell", { name: "Coparmex Puebla A.C." })).toBeVisible();
  await expect(page.locator("img[alt='']")).toBeVisible();

  await page.getByRole("button", { name: "Eliminar" }).click();
  await page.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByRole("cell", { name: "Coparmex Puebla A.C." })).toBeVisible();
  await page.getByRole("button", { name: "Eliminar" }).click();
  await page.getByRole("button", { name: "Sí, eliminar" }).click();
  await expect(page).toHaveURL(/\/admin\/organismos$/);
  await expect(page.getByRole("cell", { name: /Coparmex Puebla/ })).toHaveCount(0);

  await page.goto(detail);
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});
