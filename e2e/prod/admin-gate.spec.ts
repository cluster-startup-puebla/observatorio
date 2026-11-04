import { expect, test } from "@playwright/test";

test("innovación abierta manda al login", async ({ page }) => {
  await page.goto("/admin/innovacion");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByText("Empresas que aceptaron que el Observatorio las contacte.")).toHaveCount(0);
  await expect(page.getByLabel("Correo")).toBeVisible();
});

test("el alta del primer superadmin ya no está abierta", async ({ page }) => {
  await page.goto("/admin/signup");
  await expect(page.getByTestId("alta-superadmin")).toHaveCount(0);
});
