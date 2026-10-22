import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  const response = await request.post("/test/reset");
  expect(response.ok()).toBeTruthy();
});

async function finishBrand(page: import("@playwright/test").Page, email: string) {
  await page.goto("/register?cuenta=organismo");
  await page.getByLabel("Correo").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill("secreto-largo");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.getByLabel("Nombre del organismo").fill("CANACINTRA");
  await page.getByLabel("Color").fill("#1B3A5C");
  await page.getByLabel("Logo").setInputFiles("e2e/fixtures/logo.png");
  await page.getByRole("button", { name: "Terminar perfil" }).click();
  await expect(page).toHaveURL(/\/canacintra$/);
}

test("el organismo carga el Excel y copia el enlace", async ({ page }) => {
  await finishBrand(page, "mesa@camara.mx");
  await page.getByRole("link", { name: "Invitaciones" }).click();
  const download = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Descargar plantilla" }).click(),
  ]).then(([file]) => file);
  expect(download.suggestedFilename()).toBe("plantilla-invitaciones.csv");
  await expect(page.getByTestId("carga-lista")).toBeAttached();
  await page.getByLabel("Archivo de invitaciones").setInputFiles("e2e/fixtures/invitaciones.csv");
  await expect(page).toHaveURL(/\/canacintra\/crm/);
  await expect(page.getByRole("cell", { name: "ana@norte.mx" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Pendiente" })).toBeVisible();
  await page.goto("/canacintra/invitaciones");
  await expect(page.getByTestId("carga-lista")).toBeAttached();
  await page.getByLabel("Archivo de invitaciones").setInputFiles("e2e/fixtures/invitaciones.csv");
  await expect(page).toHaveURL(/\/canacintra\/crm/);
  await expect(page.getByRole("cell", { name: "ana@norte.mx" })).toHaveCount(1);
  await page.getByRole("button", { name: "Contactar" }).click();
  await expect(page.getByRole("cell", { name: "Contactado" })).toBeVisible();
  await page.getByRole("link", { name: "Tarjetas" }).click();
  await expect(page.getByRole("article").filter({ hasText: "ana@norte.mx" })).toBeVisible();
});

test("un archivo sin filas no inventa invitaciones", async ({ page }) => {
  await finishBrand(page, "vacio@camara.mx");
  await page.getByRole("link", { name: "Invitaciones" }).click();
  await expect(page.getByTestId("carga-lista")).toBeAttached();
  await page.getByLabel("Archivo de invitaciones").setInputFiles("e2e/fixtures/vacio.csv");
  await expect(page).toHaveURL(/\/canacintra\/crm/);
  await expect(page.getByText("Todavía no hay invitaciones.")).toBeVisible();
  await expect(page.getByRole("cell", { name: "ana@norte.mx" })).toHaveCount(0);
});

test("una invitación a mano entra como Pendiente", async ({ page }) => {
  await finishBrand(page, "manual@camara.mx");
  await page.getByRole("link", { name: "Invitaciones" }).click();
  await page.getByLabel("Nombre").fill("Luis");
  await page.getByLabel("Empresa").fill("Sur");
  await page.getByLabel("Correo del invitado").fill("luis@sur.mx");
  await page.getByRole("button", { name: "Crear invitación" }).click();
  await expect(page).toHaveURL(/\/canacintra\/crm/);
  await expect(page.getByRole("cell", { name: "luis@sur.mx" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Pendiente" })).toBeVisible();
});
