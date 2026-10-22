import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  const response = await request.post("/test/reset");
  expect(response.ok()).toBeTruthy();
});

test("sin superadmin el alta crea solo el primero", async ({ page }) => {
  await page.goto("/admin/signup");
  await expect(page.getByRole("navigation", { name: "Principal" })).toHaveCount(0);
  await expect(page.getByRole("contentinfo")).toHaveCount(0);
  await expect(page.getByTestId("alta-superadmin")).toBeVisible();
  await page.getByLabel("Correo").fill("ana@admin.mx");
  await page.getByLabel("Contraseña", { exact: true }).fill("secreto-largo");
  await page.getByRole("button", { name: "Crear superadmin" }).click();
  await expect(page.getByTestId("panel-superadmin")).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("panel-superadmin")).toBeVisible();
  await page.goto("/admin/signup");
  await expect(page.getByTestId("alta-superadmin")).toHaveCount(0);
  await expect(page.getByTestId("panel-superadmin")).toBeVisible();
});

test("una contraseña corta no crea el superadmin", async ({ page }) => {
  await page.goto("/admin/signup");
  await page.getByLabel("Correo").fill("ana@admin.mx");
  await page.getByLabel("Contraseña", { exact: true }).fill("corta");
  await page.getByRole("button", { name: "Mostrar contraseña" }).click();
  await expect(page.getByLabel("Contraseña", { exact: true })).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Ocultar contraseña" }).click();
  await expect(page.getByLabel("Contraseña", { exact: true })).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Crear superadmin" }).click();
  await expect(page.getByText("Usa al menos 8 caracteres.")).toBeVisible();
  await expect(page.getByTestId("alta-superadmin")).toBeVisible();
});

test("un correo inválido no crea el superadmin", async ({ page }) => {
  await page.goto("/admin/signup");
  await page.getByLabel("Correo").fill("no-es-correo");
  await page.getByLabel("Contraseña", { exact: true }).fill("secreto-largo");
  await page.getByRole("button", { name: "Crear superadmin" }).click();
  await expect(page.getByText("Escribe un correo válido.")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/signup\?error=correo/);
});
