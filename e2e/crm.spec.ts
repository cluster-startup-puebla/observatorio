import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  const response = await request.post("/test/reset");
  expect(response.ok()).toBeTruthy();
});

test("el organismo carga el Excel y copia el enlace", async ({ page }) => {
  await page.goto("/register?cuenta=organismo");
  await page.getByLabel("Correo").fill("mesa@camara.mx");
  await page.getByLabel("Contraseña").fill("secreto-largo");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.getByLabel("Nombre del organismo").fill("CANACINTRA");
  await page.getByLabel("Color").fill("#1B3A5C");
  await page.getByLabel("Logo").setInputFiles("e2e/fixtures/logo.png");
  await page.getByRole("button", { name: "Terminar perfil" }).click();
  await expect(page.getByRole("link", { name: "Tablero" })).toBeVisible();
  await expect(page.getByRole("link", { name: "CRM" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Analítica" })).toBeVisible();
  await page.getByRole("link", { name: "Analítica" }).click();
  await expect(page.getByText("Próximamente")).toBeVisible();
  const download = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Descargar plantilla" }).click(),
  ]).then(([file]) => file);
  expect(download.suggestedFilename()).toBe("plantilla-invitaciones.csv");
  await expect(page.getByTestId("carga-lista")).toBeAttached();
  await page.getByLabel("Archivo de invitaciones").setInputFiles("e2e/fixtures/invitaciones.csv");
  await expect(page.getByRole("cell", { name: "ana@norte.mx" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Cargado" })).toBeVisible();
  await page.getByLabel("Archivo de invitaciones").setInputFiles("e2e/fixtures/invitaciones.csv");
  await expect(page.getByRole("cell", { name: "ana@norte.mx" })).toHaveCount(1);
  await page.getByRole("button", { name: "Contactar" }).click();
  await expect(page.getByRole("cell", { name: "Contactado" })).toBeVisible();
});

test("un archivo sin filas no inventa invitaciones", async ({ page }) => {
  await page.goto("/register?cuenta=organismo");
  await page.getByLabel("Correo").fill("vacio@camara.mx");
  await page.getByLabel("Contraseña").fill("secreto-largo");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.getByLabel("Nombre del organismo").fill("CANACINTRA");
  await page.getByLabel("Color").fill("#1B3A5C");
  await page.getByLabel("Logo").setInputFiles("e2e/fixtures/logo.png");
  await page.getByRole("button", { name: "Terminar perfil" }).click();
  await expect(page.getByRole("heading", { name: "Tu evento" })).toBeVisible();
  await expect(page.getByTestId("carga-lista")).toBeAttached();
  await page.getByLabel("Archivo de invitaciones").setInputFiles("e2e/fixtures/vacio.csv");
  await expect(page.getByRole("heading", { name: "Invitaciones" })).toBeVisible();
  await expect(page.getByText("Todavía no hay invitaciones.")).toBeVisible();
  await expect(page.getByRole("cell", { name: "ana@norte.mx" })).toHaveCount(0);
});
