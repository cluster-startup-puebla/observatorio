import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  const response = await request.post("/test/reset");
  expect(response.ok()).toBeTruthy();
});

test("la mesa saluda a quien ya tiene QR", async ({ page }) => {
  await page.goto("/mesa");
  await page.getByLabel("Código QR").fill("persona-registrada");
  await page.getByRole("button", { name: "Registrar llegada" }).click();
  await expect(page.getByTestId("bienvenida")).toHaveText("Bienvenida, Ana López");
  await expect(page.getByTestId("estatus")).toHaveText("Llegó");
});

test("el superadmin encola innovación abierta", async ({ page }) => {
  await page.goto("/admin/correo");
  await page.getByRole("button", { name: "Enviar innovación abierta" }).click();
  await expect(page.getByTestId("encolados")).toContainText("1");
});

test("un código vacío o desconocido no marca llegada", async ({ page }) => {
  await page.goto("/mesa");
  await page.getByRole("button", { name: "Registrar llegada" }).click();
  await expect(page.getByText("Escribe el código del QR.")).toBeVisible();
  await page.getByLabel("Código QR").fill("nadie");
  await page.getByRole("button", { name: "Registrar llegada" }).click();
  await expect(page.getByText("sin qr")).toBeVisible();
  await expect(page.getByTestId("bienvenida")).toHaveCount(0);
});

test("el segundo escaneo no vuelve a marcar llegada", async ({ page }) => {
  await page.goto("/mesa");
  await page.getByLabel("Código QR").fill("persona-registrada");
  await page.getByRole("button", { name: "Registrar llegada" }).click();
  await expect(page.getByTestId("estatus")).toHaveText("Llegó");
  await page.getByRole("button", { name: "Registrar llegada" }).click();
  await expect(page.getByText("transición inválida")).toBeVisible();
  await expect(page.getByTestId("bienvenida")).toHaveCount(0);
});
