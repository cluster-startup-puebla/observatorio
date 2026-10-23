import { expect, test, type Page } from "@playwright/test";

async function submitCode(page: Page, code: string) {
  await page.locator('input[name="codigo"]').evaluate((input, value) => {
    const field = input as HTMLInputElement;
    field.value = value;
    field.form?.requestSubmit();
  }, code);
}

test.beforeEach(async ({ request }) => {
  const response = await request.post("/test/reset");
  expect(response.ok()).toBeTruthy();
});

test("la mesa saluda a quien ya tiene QR", async ({ page }) => {
  await page.goto("/admin/mesa");
  await submitCode(page, "persona-registrada");
  await expect(page.getByTestId("bienvenida")).toHaveText("Bienvenida, Ana López");
  await expect(page.getByTestId("estatus")).toHaveText("Llegó");
});

test("el superadmin encola innovación abierta", async ({ page }) => {
  await page.goto("/admin/correo");
  await page.getByRole("button", { name: "Enviar innovación abierta" }).click();
  await expect(page.getByTestId("encolados")).toContainText("1");
});

test("un código vacío o desconocido no marca llegada", async ({ page }) => {
  await page.goto("/admin/mesa");
  await submitCode(page, "");
  await expect(page.getByText("No se leyó ningún pase.")).toBeVisible();
  await submitCode(page, "nadie");
  await expect(page.getByText("Ese código no tiene pase.")).toBeVisible();
  await expect(page.getByTestId("bienvenida")).toHaveCount(0);
});

test("el segundo escaneo no vuelve a marcar llegada", async ({ page }) => {
  await page.goto("/admin/mesa");
  await submitCode(page, "persona-registrada");
  await expect(page.getByTestId("estatus")).toHaveText("Llegó");
  await submitCode(page, "persona-registrada");
  await expect(page.getByText("Esta persona ya registró su llegada.")).toBeVisible();
  await expect(page.getByTestId("bienvenida")).toHaveCount(0);
});

test("el moderador ve el avance y no el botón de correo", async ({ page }) => {
  await page.goto("/metodologia?persona=p-mod");
  await expect(page.getByTestId("metodologia-lista")).toBeAttached();
  await page.getByRole("radio", { name: "Papel/Bitácoras" }).check();
  await page.goto("/panel?rol=moderador");
  await expect(page.getByTestId("avance-p-mod")).toContainText("1");
  await page.goto("/admin/correo?rol=moderador");
  await expect(page.getByRole("button", { name: "Enviar innovación abierta" })).toHaveCount(0);
});
