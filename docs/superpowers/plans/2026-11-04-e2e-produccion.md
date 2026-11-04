# E2E de producción Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Comprobar, contra `https://observatorio.clusterdestartups.org/`, que el sitio publicado habla con el Supabase correcto, no deja la lista de innovación abierta a un anónimo y no apunta los correos a localhost.

**Architecture:** Los e2e actuales levantan `npm run dev` con `DIRECTORY=memory` y `AUTH_PROVIDER=memory`. No se tocan. Una config aparte, `playwright.prod.config.ts`, no arranca servidor y pega al sitio real. Las pruebas son de lectura, más un POST con un token inválido que no escribe filas. No se crea cuenta, no se inicia sesión con una contraseña guardada en el repo y no se manda correo masivo.

**Tech Stack:** Playwright, Chromium, el sitio en Vercel.

**Hecho ya visto, para no redescubrirlo:** la home responde 200 por HTTPS, el `og:url` es `https://observatorio.clusterdestartups.org/og.png`, y `/logos/logo-cluster.webp` responde 200. El anónimo que pide `/admin/innovacion` recibe un HTML que menciona `/admin/login` y no el texto «Empresas que aceptaron». El proyecto de Supabase esperado es `jnshenkmexsxiylpqhdh`.

## Fuera de este plan

- Correr `npm run test:e2e` contra producción. Ese comando sigue siendo local y con directorio en memoria.
- Enviar innovación abierta, recordatorio o gracias a la audiencia.
- Crear un empresario o un superadmin.
- Guardar `RESEND_API_KEY`, `MAIL_FROM` o la contraseña del superadmin en el repo.
- Aplicar migraciones. Ya están en LevantamientoDeNecesidades.
- Arreglar el prerender de `/admin/innovacion` si la prueba lo encuentra abierto. Esta pasada solo lo detecta.

## Archivos

- Crear: `playwright.prod.config.ts`
- Crear: `e2e/prod/public.spec.ts`
- Crear: `e2e/prod/supabase-client.spec.ts`
- Crear: `e2e/prod/consent.spec.ts`
- Crear: `e2e/prod/admin-gate.spec.ts`
- Modificar: `package.json` (un script)

Cada spec queda en 90 líneas o menos.

---

### Task 1: Config que no levanta el dev server

**Files:**
- Create: `playwright.prod.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the config**

`playwright.prod.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "https://observatorio.clusterdestartups.org";

export default defineConfig({
  testDir: "e2e/prod",
  fullyParallel: false,
  workers: 1,
  retries: 1,
  timeout: 30_000,
  use: { baseURL, trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

No pongas `webServer`. No pongas `DIRECTORY` ni `AUTH_PROVIDER`.

En `package.json`, junto a `test:e2e`:

```json
"test:e2e:prod": "playwright test -c playwright.prod.config.ts"
```

- [ ] **Step 2: Confirm the local suite still points at memory**

`playwright.config.ts` debe seguir con `baseURL: "http://127.0.0.1:3000"` y `env: { DIRECTORY: "memory", AUTH_PROVIDER: "memory" }`. No lo edites.

- [ ] **Step 3: Commit**

```bash
git add playwright.prod.config.ts package.json
git commit -m "$(cat <<'EOF'
test: add a production playwright config

EOF
)"
```

---

### Task 2: Home, ficha social y logos

**Files:**
- Create: `e2e/prod/public.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
import { expect, test } from "@playwright/test";

test("la home publicada es la del observatorio", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();
  expect(response?.url()).toMatch(/^https:\/\/observatorio\.clusterdestartups\.org\/?$/);
  await expect(
    page.getByRole("heading", {
      name: "Lo que Puebla no sabe que necesita, tu empresa puede decirlo primero.",
    }),
  ).toBeVisible();
  await expect(page.getByTestId("bloque-evento")).toContainText("Quinta Real");
});

test("la ficha social apunta a este dominio", async ({ page }) => {
  await page.goto("/");
  const og = page.locator('meta[property="og:image"]');
  await expect(og).toHaveAttribute("content", /^https:\/\/observatorio\.clusterdestartups\.org\/og\.png/);
});

test("el logo del clúster y la imagen social cargan", async ({ request }) => {
  const logo = await request.get("/logos/logo-cluster.webp");
  const card = await request.get("/og.png");
  expect(logo.ok()).toBeTruthy();
  expect(logo.headers()["content-type"]).toContain("image/");
  expect(card.ok()).toBeTruthy();
});

test("un sector real queda seleccionado", async ({ page }) => {
  await page.goto("/automotriz-y-autopartes");
  await expect(page.getByTestId("sector-seleccionado")).toHaveText(
    "Empresa del sector Automotriz y autopartes.",
  );
});
```

- [ ] **Step 2: Run it**

Run: `npx playwright test -c playwright.prod.config.ts e2e/prod/public.spec.ts`

Expected: 4 passed. Si `og:image` sale relativo (`/og.png`), falla: en producción `NEXT_PUBLIC_SITE_URL` debe ser `https://observatorio.clusterdestartups.org` para que los correos no armen logos en localhost.

- [ ] **Step 3: Commit**

```bash
git add e2e/prod/public.spec.ts
git commit -m "$(cat <<'EOF'
test: check the published landing and its public images

EOF
)"
```

---

### Task 3: El cliente publicado habla con el proyecto correcto

**Files:**
- Create: `e2e/prod/supabase-client.spec.ts`

El build de Next mete `NEXT_PUBLIC_SUPABASE_URL` en los chunks. Hay que leer esos chunks, no adivinar por el HTML de la home.

- [ ] **Step 1: Write the spec**

```ts
import { expect, test } from "@playwright/test";

const projectHost = "jnshenkmexsxiylpqhdh.supabase.co";

test("el JavaScript público apunta al Supabase de Levantamiento", async ({ page, request }) => {
  await page.goto("/register");
  const srcs = await page.locator("script[src]").evaluateAll((nodes) =>
    nodes.map((node) => (node as HTMLScriptElement).src),
  );
  const bodies = await Promise.all(srcs.map(async (src) => (await request.get(src)).text()));
  const joined = bodies.join("\n");
  expect(joined).toContain(projectHost);
  expect(joined).not.toContain("127.0.0.1:54321");
  expect(joined).not.toContain("localhost:3000");
});
```

- [ ] **Step 2: Run it**

Run: `npx playwright test -c playwright.prod.config.ts e2e/prod/supabase-client.spec.ts`

Expected: PASS. Si falla, el deploy no tiene `NEXT_PUBLIC_SUPABASE_URL` del proyecto `jnshenkmexsxiylpqhdh`, o un chunk todavía cita localhost.

- [ ] **Step 3: Commit**

```bash
git add e2e/prod/supabase-client.spec.ts
git commit -m "$(cat <<'EOF'
test: check production points at the observatory database

EOF
)"
```

---

### Task 4: El permiso no se otorga al abrir el enlace

**Files:**
- Create: `e2e/prod/consent.spec.ts`

El POST usa un token que no existe. `accept_open_innovation` responde `invalido` y no inserta filas.

- [ ] **Step 1: Write the spec**

```ts
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
```

- [ ] **Step 2: Run it**

Run: `npx playwright test -c playwright.prod.config.ts e2e/prod/consent.spec.ts`

Expected: 2 passed. Si el segundo cae en error de red o en una página 500, el deploy no tiene `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, o la función `accept_open_innovation` no está en esa base.

- [ ] **Step 3: Commit**

```bash
git add e2e/prod/consent.spec.ts
git commit -m "$(cat <<'EOF'
test: check the production consent link rejects a bad token

EOF
)"
```

---

### Task 5: El anónimo no ve quién aceptó

**Files:**
- Create: `e2e/prod/admin-gate.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
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
```

- [ ] **Step 2: Run it**

Run: `npx playwright test -c playwright.prod.config.ts e2e/prod/admin-gate.spec.ts`

Expected: 2 passed. Si la URL se queda en `/admin/innovacion` y se lee el lead de la lista, el prerender publicó la pantalla. Eso es un fallo de esta prueba, no un ajuste del expect.

- [ ] **Step 3: Commit**

```bash
git add e2e/prod/admin-gate.spec.ts
git commit -m "$(cat <<'EOF'
test: check the production admin list stays behind login

EOF
)"
```

---

### Task 6: Correr la pasada y anotar el resultado

- [ ] **Step 1: Run the production suite once**

Run: `npx playwright test -c playwright.prod.config.ts`

Expected: 9 passed. No debe haber arrancado `npm run dev`.

- [ ] **Step 2: Leave the local suite alone**

No corras `npm run test:e2e` como sustituto. Ese sigue en memoria.

Si una prueba falla, el reporte nombra la variable o la ruta. No se reintenta el masivo ni se crea una cuenta para “hacerla pasar”.
