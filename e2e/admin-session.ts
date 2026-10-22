import { expect, type Page } from "@playwright/test";

export async function signUpSuperadmin(page: Page) {
  await page.goto("/admin/signup");
  await page.getByLabel("Correo").fill("ana@admin.mx");
  await page.getByLabel("Contraseña", { exact: true }).fill("secreto-largo");
  await page.getByRole("button", { name: "Crear superadmin" }).click();
  await expect(page.getByTestId("panel-superadmin")).toBeVisible();
}

export async function openNewOrg(page: Page) {
  await page.goto("/admin/organismos");
  await page.getByRole("button", { name: "Nuevo organismo" }).click();
  await expect(page.getByLabel("Logo")).toBeVisible();
}
