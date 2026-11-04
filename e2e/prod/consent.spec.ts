import { expect, test } from "@playwright/test";

test("sin token el enlace no acepta", async ({ page }) => {
  await page.goto("/innovacion-abierta/aceptar");
  await expect(page.getByRole("heading", { name: "Acepta que te contactemos" })).toBeVisible();
  await expect(page.getByText("Este enlace no sirve. Ábrelo desde el correo que te enviamos.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sí, pueden contactarme" })).toHaveCount(0);
});

test("un token inválido vuelve a la página de error", async ({ page }) => {
  const token = "a".repeat(43);
  await page.goto(`/innovacion-abierta/aceptar?t=${token}`);
  await page.getByRole("button", { name: "Sí, pueden contactarme" }).click();
  await expect(page).toHaveURL(/\/innovacion-abierta\/aceptar\?error=1$/);
  await expect(page.getByText("Este enlace no sirve. Ábrelo desde el correo que te enviamos.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ya podemos contactarte" })).toHaveCount(0);
});
