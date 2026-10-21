import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  const response = await request.post("/test/reset");
  expect(response.ok()).toBeTruthy();
});

test("el empresario termina el perfil con el sector de la ruta", async ({ page }) => {
  await page.goto("/automotriz-y-autopartes");
  await page.getByRole("link", { name: "Reservar mi lugar" }).first().click();
  await page.getByLabel("Correo").fill("ana@norte.mx");
  await page.getByLabel("Contraseña").fill("secreto-largo");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByTestId("aviso-confidencial")).toHaveText(
    "Esta información es solo estadística. No se comparte y es confidencial.",
  );
  await expect(page.getByTestId("sector-elegido")).toHaveText("Automotriz y autopartes");
  await page.getByRole("radio", { name: "11–50" }).check();
  await page.getByRole("button", { name: "Terminar perfil" }).click();
  await expect(page.getByTestId("qr-listo")).toBeVisible();
});

test("el organismo no invita hasta terminar su marca", async ({ page }) => {
  await page.goto("/register?cuenta=organismo");
  await page.getByLabel("Correo").fill("director@canacintra.mx");
  await page.getByLabel("Contraseña").fill("secreto-largo");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByRole("button", { name: "Copiar enlace del evento" })).toBeDisabled();
  await page.getByLabel("Nombre del organismo").fill("CANACINTRA");
  await page.getByLabel("Color").fill("#1B3A5C");
  await page.getByLabel("Logo").setInputFiles("e2e/fixtures/logo.png");
  await page.getByRole("button", { name: "Terminar perfil" }).click();
  await expect(page.getByRole("button", { name: "Copiar enlace del evento" })).toBeEnabled();
});

test("una contraseña corta no abre el perfil", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Correo").fill("ana@norte.mx");
  await page.getByLabel("Contraseña").fill("corta");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByText("Usa al menos 8 caracteres.")).toBeVisible();
  await expect(page).toHaveURL(/\/register$/);
});

test("sin tamaño de empresa no aparece el pase", async ({ page }) => {
  await page.goto("/register?sector=turismo");
  await page.getByLabel("Correo").fill("sin-tamano@norte.mx");
  await page.getByLabel("Contraseña").fill("secreto-largo");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.getByRole("button", { name: "Terminar perfil" }).click();
  await expect(page.getByText("Elige el tamaño de tu empresa para terminar.")).toBeVisible();
  await expect(page.getByTestId("qr-listo")).toHaveCount(0);
});
