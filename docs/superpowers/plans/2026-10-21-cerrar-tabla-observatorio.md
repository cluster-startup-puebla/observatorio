# Cerrar la tabla de planeación Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cerrar las filas abiertas de la tabla de planeación con pruebas, sin rehacer lo que ya está en memoria ni construir analítica, conexiones o el reporte `v`/CSV.

**Architecture:** La app sigue hablando con `Directory`. Playwright se queda en `DIRECTORY=memory`. Las tareas de pantalla extienden ese contrato y sus e2e. Al final, `DIRECTORY=supabase` usa las tablas ya migradas en LevantamientoDeNecesidades. Auth usa los seis roles de `profiles`, no el plan del 15 de octubre.

**Tech Stack:** Next.js 16 App Router, Vitest 3, Playwright, Supabase Auth, Postgres y Storage.

---

## Fuera de este plan

Estas filas se quedan en No. La planeación no les dio forma.

- Contenido de analítica.
- Módulo de conexiones.
- Reporte `v` / CSV.

## Qué no se vuelve a hacer

Ya está en GitHub y en los e2e: arnés, matriz de permisos, máquina de estatus, sector por ruta, cifrado del enlace, plantilla CSV, puntaje Bronce/Plata/Oro, landing, onboarding, tres entradas del organismo, guardado de la pregunta 1, `diagnostico.txt`, mesa y bandeja de innovación abierta.

## Mapa de archivos

| Archivo | Responsabilidad |
| --- | --- |
| `src/lib/directory.ts` | Contrato. Se agregan solo los métodos que una tarea nombra. |
| `src/lib/memory-directory.ts` | Implementación que Playwright ya usa. |
| `src/lib/supabase/server.ts` | Cliente de servidor. No se importa desde componentes cliente. |
| `src/lib/supabase-directory.ts` | El mismo contrato contra las tablas migradas. |
| `src/lib/outbox-message.ts` | Arma los tres correos. No abre SMTP. |
| `e2e/*.spec.ts` | Cada pantalla nueva. `beforeEach` hace `POST /test/reset`. |

Orden: primero las pantallas sobre memoria, después el adaptador. No cambiar `playwright.config.ts`: `DIRECTORY=memory` se queda.

---

### Task 1: Aviso de confidencialidad en la metodología

**Files:**
- Modify: `src/app/metodologia/page.tsx`
- Test: `e2e/metodologia.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
test("la metodología repite el aviso de confidencialidad", async ({ page }) => {
  await page.goto("/metodologia?persona=p-aviso");
  await expect(page.getByTestId("aviso-confidencial")).toHaveText(
    "Esta información es solo estadística. No se comparte y es confidencial.",
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- e2e/metodologia.spec.ts -g "aviso de confidencialidad"`

Expected: FAIL. No existe `aviso-confidencial` en `/metodologia`.

- [ ] **Step 3: Write minimal implementation**

En `src/app/metodologia/page.tsx`, encima de `QuestionStep`, renderizar el componente que ya existe:

```tsx
import { ConfidentialityNote } from "@/components/onboarding/confidentiality-note";

// dentro del grid, antes de QuestionStep
<ConfidentialityNote />
```

No crear otro texto. `ConfidentialityNote` ya tiene el `data-testid` y la frase exacta.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- e2e/metodologia.spec.ts`

Expected: PASS, incluidos los tests que ya existían.

- [ ] **Step 5: Commit**

```bash
git add src/app/metodologia/page.tsx e2e/metodologia.spec.ts
git commit -m "test: la metodología repite el aviso de confidencialidad"
```

---

### Task 2: Reintento si falla el guardado

**Files:**
- Create: `src/lib/save-answer.ts`
- Modify: `src/lib/flow-actions.ts`
- Modify: `src/app/metodologia/page.tsx`
- Test: `src/lib/save-answer.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";
import { saveWithRetry } from "./save-answer";

describe("saveWithRetry", () => {
  it("reintenta una vez y luego conserva el valor", async () => {
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error("red"))
      .mockResolvedValueOnce(undefined);
    const result = await saveWithRetry(save, { personId: "p1", questionId: "1", value: "a" });
    expect(result).toEqual({ ok: true, attempts: 2 });
    expect(save).toHaveBeenCalledTimes(2);
  });

  it("después de dos fallos no dice que quedó guardada", async () => {
    const save = vi.fn().mockRejectedValue(new Error("red"));
    const result = await saveWithRetry(save, { personId: "p1", questionId: "1", value: "a" });
    expect(result).toEqual({ ok: false, attempts: 2 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/save-answer.test.ts`

Expected: FAIL. No existe `./save-answer`.

- [ ] **Step 3: Write minimal implementation**

```ts
export async function saveWithRetry(
  save: (input: { personId: string; questionId: string; value: string }) => Promise<void>,
  input: { personId: string; questionId: string; value: string },
) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      await save(input);
      return { ok: true as const, attempts: attempt };
    } catch {
      if (attempt === 2) return { ok: false as const, attempts: 2 };
    }
  }
  return { ok: false as const, attempts: 2 };
}
```

`saveMethodologyForm` llama `saveWithRetry`. Si `ok` es false, redirige con `error=guardar` y no muestra «Guardada». Si `ok` es true, sigue el redirect de la Task 3. Hasta que esa task exista, redirige a la misma persona:

```ts
const result = await saveWithRetry(
  (input) => getDirectory().saveAnswer(input),
  { personId: persona, questionId, value },
);
const query = new URLSearchParams({ persona });
if (!result.ok) query.set("error", "guardar");
redirect(`/metodologia?${query.toString()}`);
```

En la página, si `searchParams.error === "guardar"`:

```tsx
<p className="text-small text-mark">No se pudo guardar. Vuelve a elegir la respuesta.</p>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/save-answer.test.ts && npm run test:e2e -- e2e/metodologia.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/save-answer.ts src/lib/save-answer.test.ts src/lib/flow-actions.ts src/app/metodologia/page.tsx
git commit -m "test: el guardado de la metodología reintenta una vez"
```

---

### Task 3: Cuestionario por secciones

**Files:**
- Modify: `src/app/metodologia/page.tsx`
- Modify: `src/lib/flow-actions.ts`
- Test: `e2e/metodologia.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
test("guardar la primera pregunta abre la segunda", async ({ page }) => {
  await page.goto("/metodologia?persona=p-pasos");
  await expect(page.getByTestId("metodologia-lista")).toBeAttached();
  await page.getByRole("radio", { name: "Papel/Bitácoras" }).check();
  await expect(
    page.getByText("¿La información de producción se puede consultar sin pedirla a una persona?"),
  ).toBeVisible();
  await expect(page.getByTestId("seccion-actual")).toHaveText("Infraestructura y digitalización");
  await expect(page.getByTestId("progreso-preguntas")).toHaveText("1 de 18");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- e2e/metodologia.spec.ts -g "abre la segunda"`

Expected: FAIL. La pregunta 2 no está en la página.

- [ ] **Step 3: Write minimal implementation**

```ts
const flat = SECTIONS.flatMap((section) =>
  section.questions.map((question) => ({ section, question })),
);
const current = flat.find((item) => String(item.question.id) === (params.pregunta ?? "1")) ?? flat[0];
```

```tsx
<p data-testid="seccion-actual">{current.section.name}</p>
<p data-testid="progreso-preguntas">{Object.keys(stored).length} de 18</p>
<QuestionStep
  persona={persona}
  question={current.question}
  saved={stored[String(current.question.id)] ?? ""}
/>
```

Después de un guardado correcto, `saveMethodologyForm` redirige a la pregunta siguiente, con tope 18:

```ts
const next = String(Math.min(Number(questionId) + 1, 18));
query.set("pregunta", result.ok ? next : questionId);
```

El test «la respuesta sobrevive al recargar» debe volver a abrir `?persona=p-e2e&pregunta=1` para encontrar el radio de «Papel/Bitácoras».

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- e2e/metodologia.spec.ts && npm test`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/metodologia/page.tsx src/lib/flow-actions.ts e2e/metodologia.spec.ts
git commit -m "test: la metodología avanza de pregunta al guardar"
```

---

### Task 4: Contactar y rechazar en el CRM

**Files:**
- Modify: `src/lib/directory.ts`
- Modify: `src/lib/memory-directory.ts`
- Create: `src/lib/crm-actions.ts`
- Modify: `src/app/organismo/crm/page.tsx`
- Test: `src/lib/crm-directory.test.ts`
- Test: `e2e/crm.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("contactar y rechazar solo ocurren desde un estatus abierto", async () => {
  const directory = getDirectory();
  const org = await directory.createAccount({ email: "dir@camara.mx", role: "director" });
  await directory.importInvites(org.id, [
    { nombre: "Ana", empresa: "Norte", correo: "ana@norte.mx" },
    { nombre: "Beto", empresa: "Sur", correo: "beto@sur.mx" },
  ]);
  const [ana, beto] = await directory.crm(org.id);
  expect(await directory.applyCrm(ana.id, "contactar")).toEqual({ ok: true, status: "contactado" });
  expect(await directory.applyCrm(beto.id, "rechazar")).toEqual({ ok: true, status: "no" });
  expect(await directory.applyCrm(beto.id, "contactar")).toEqual({
    ok: false,
    reason: "transición inválida",
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/crm-directory.test.ts`

Expected: FAIL. `applyCrm` no existe.

- [ ] **Step 3: Write minimal implementation**

En `Directory`:

```ts
applyCrm(
  personId: string,
  event: "contactar" | "rechazar",
): Promise<{ ok: true; status: "contactado" | "no" } | { ok: false; reason: string }>;
```

En memoria, `applyCrmEvent(person.status, event)` decide. Si `ok`, se guarda `person.status`.

Cada fila `Cargado` o `Contactado` del CRM muestra dos forms que postean `crmEventAction` con `personId` y `event`. La acción solo aplica el hecho si esa fila pertenece al organismo de la cookie. Luego `redirect("/organismo/crm")`.

E2e, después de cargar el CSV:

```ts
await page.getByRole("button", { name: "Contactar" }).click();
await expect(page.getByRole("cell", { name: "Contactado" })).toBeVisible();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/crm-directory.test.ts && npm run test:e2e -- e2e/crm.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/directory.ts src/lib/memory-directory.ts src/lib/crm-actions.ts src/lib/crm-directory.test.ts src/app/organismo/crm/page.tsx e2e/crm.spec.ts
git commit -m "test: el CRM contacta o rechaza solo con un hecho válido"
```

---

### Task 5: Confirmar al crear la cuenta y registrar al terminar el perfil

**Files:**
- Modify: `src/lib/memory-directory.ts`
- Test: `src/lib/crm-directory.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("la cuenta del invitado confirma y el perfil lo registra", async () => {
  const directory = getDirectory();
  const org = await directory.createAccount({ email: "dir@camara.mx", role: "director" });
  await directory.importInvites(org.id, [{ nombre: "Ana", empresa: "Norte", correo: "ana@norte.mx" }]);
  const account = await directory.createAccount({ email: "ana@norte.mx", role: "empresario" });
  expect((await directory.crm(org.id))[0].status).toBe("confirmo");
  await directory.completeOnboarding(account.id, { sectorSlug: "turismo", size: "1–10", name: "Ana" });
  expect((await directory.crm(org.id))[0].status).toBe("registrado");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/crm-directory.test.ts`

Expected: FAIL. La fila sigue en `cargado`.

- [ ] **Step 3: Write minimal implementation**

En `createAccount`, para cada fila de CRM con el mismo email, aplicar `confirmar` solo si `applyCrmEvent` regresa `ok`.

En `completeOnboarding`, aplicar `registrar` a esas filas si el estatus ya es `confirmo`.

No pasar una fila de `cargado` directo a `registrado`. Una cuenta que no está en ningún CRM no cambia este flujo: los tests actuales de `completeOnboarding` siguen viendo el perfil en `registrado`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/crm-directory.test.ts src/lib/memory-directory.test.ts src/lib/desk.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/memory-directory.ts src/lib/crm-directory.test.ts
git commit -m "test: la cuenta confirma la fila y el perfil la registra"
```

---

### Task 6: Invitación a mano

**Files:**
- Create: `src/components/organismo/manual-invite.tsx`
- Modify: `src/lib/organismo-actions.ts`
- Modify: `src/app/organismo/crm/page.tsx`
- Test: `e2e/crm.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
test("una invitación a mano entra como Cargado", async ({ page }) => {
  await page.goto("/register?cuenta=organismo");
  await page.getByLabel("Correo").fill("manual@camara.mx");
  await page.getByLabel("Contraseña").fill("secreto-largo");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.getByLabel("Nombre del organismo").fill("CANACINTRA");
  await page.getByLabel("Color").fill("#1B3A5C");
  await page.getByLabel("Logo").setInputFiles("e2e/fixtures/logo.png");
  await page.getByRole("button", { name: "Terminar perfil" }).click();
  await page.getByRole("link", { name: "CRM" }).click();
  await page.getByLabel("Nombre").fill("Luis");
  await page.getByLabel("Empresa").fill("Sur");
  await page.getByLabel("Correo del invitado").fill("luis@sur.mx");
  await page.getByRole("button", { name: "Crear invitación" }).click();
  await expect(page.getByRole("cell", { name: "luis@sur.mx" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Cargado" })).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- e2e/crm.spec.ts -g "invitación a mano"`

Expected: FAIL. No existe «Correo del invitado».

- [ ] **Step 3: Write minimal implementation**

El form manda `nombre`, `empresa` y `correo` a una acción que llama `importInvites` con una fila. El correo repetido no crea otra celda. La etiqueta del correo es «Correo del invitado» para no chocar con el alta. Redirect a `/organismo/crm`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- e2e/crm.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/organismo/manual-invite.tsx src/lib/organismo-actions.ts src/app/organismo/crm/page.tsx e2e/crm.spec.ts
git commit -m "test: el organismo crea una invitación a mano"
```

---

### Task 7: Copiar el enlace y mostrar la marca

**Files:**
- Modify: `src/lib/directory.ts`
- Modify: `src/lib/memory-directory.ts`
- Modify: `src/lib/organismo-actions.ts`
- Modify: `src/app/organismo/page.tsx`
- Modify: `src/app/[sector]/page.tsx`
- Modify: `src/components/landing/landing-body.tsx`
- Test: `src/lib/crm-directory.test.ts`
- Test: `e2e/landing.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("el enlace no lleva ref= y la marca solo aparece si el organismo terminó", async () => {
  const directory = getDirectory();
  const org = await directory.createAccount({ email: "dir@camara.mx", role: "director" });
  expect(await directory.brandForToken("token-falso")).toBeNull();
  await directory.completeOnboarding(org.id, {
    sectorSlug: "turismo",
    size: "organismo",
    name: "CANACINTRA",
    logoKey: `logos/${org.id}`,
  });
  const token = await directory.copyEventLink(org.id, "turismo");
  expect(token.includes("ref=")).toBe(false);
  expect(await directory.brandForToken(token)).toEqual({
    name: "CANACINTRA",
    logoKey: `logos/${org.id}`,
  });
});
```

```ts
test("un token alterado no muestra marca", async ({ page }) => {
  await page.goto("/turismo?aaaa");
  await expect(page.getByTestId("marca-organismo")).toHaveCount(0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/crm-directory.test.ts`

Expected: FAIL. `brandForToken` no existe.

- [ ] **Step 3: Write minimal implementation**

`brandForToken` usa `openRef`. Null si el token no abre o si el organismo no tiene `name` y `logoKey`.

`copyEventLinkAction` redirige a `/organismo?enlace=` más el token. La página muestra:

```tsx
<p data-testid="enlace-evento">{`/${sector}?${token}`}</p>
```

`/[sector]` toma el primer search param sin nombre de clave conocida y llama `brandForToken`. Si hay marca:

```tsx
<p data-testid="marca-organismo">{brand.name}</p>
```

El h1 de la landing no cambia en este task.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/crm-directory.test.ts && npm run test:e2e -- e2e/landing.spec.ts e2e/crm.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/directory.ts src/lib/memory-directory.ts src/lib/organismo-actions.ts src/lib/crm-directory.test.ts src/app/organismo/page.tsx src/app/[sector]/page.tsx src/components/landing/landing-body.tsx e2e/landing.spec.ts
git commit -m "test: el enlace intacto muestra la marca y el alterado no"
```

---

### Task 8: Panel del moderador

**Files:**
- Modify: `src/app/panel/page.tsx`
- Modify: `src/app/admin/correo/page.tsx`
- Test: `e2e/mesa.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
test("el moderador ve el avance y no el botón de correo", async ({ page }) => {
  await page.goto("/metodologia?persona=p-mod");
  await expect(page.getByTestId("metodologia-lista")).toBeAttached();
  await page.getByRole("radio", { name: "Papel/Bitácoras" }).check();
  await page.goto("/panel?rol=moderador");
  await expect(page.getByTestId("avance-p-mod")).toContainText("1");
  await page.goto("/admin/correo?rol=moderador");
  await expect(page.getByRole("button", { name: "Enviar innovación abierta" })).toHaveCount(0);
});
```

`/admin/correo` sin `rol` sigue mostrando el botón. Ese test ya existe y no se cambia.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- e2e/mesa.spec.ts -g "moderador"`

Expected: FAIL. El botón sigue visible.

- [ ] **Step 3: Write minimal implementation**

```ts
function roleFromQuery(value: string | undefined): Role {
  if (value === "moderador") return "moderador";
  return "superadmin";
}
```

`/admin/correo` muestra el botón solo si `can(role, "send_mass_email")`. `/panel` muestra filas si el rol es `superadmin` o `moderador`.

`?rol=` es el hueco de prueba mientras la Task 13 no lee `profiles.role`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- e2e/mesa.spec.ts`

Expected: PASS. El superadmin sigue encolando un correo.

- [ ] **Step 5: Commit**

```bash
git add src/app/panel/page.tsx src/app/admin/correo/page.tsx e2e/mesa.spec.ts
git commit -m "test: el moderador ve el avance y no envía el correo masivo"
```

---

### Task 9: Mensaje de sector solo cuando ya está escrito

**Files:**
- Modify: `src/lib/directory.ts`
- Modify: `src/lib/memory-directory.ts`
- Modify: `src/app/[sector]/page.tsx`
- Test: `src/lib/memory-directory.test.ts`
- Test: `e2e/landing.spec.ts` no cambia su h1

- [ ] **Step 1: Write the failing test**

```ts
it("sin headline el sector no cambia el mensaje", async () => {
  const directory = getDirectory();
  expect(await directory.sectorMessage("turismo")).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/memory-directory.test.ts`

Expected: FAIL. `sectorMessage` no existe.

- [ ] **Step 3: Write minimal implementation**

En memoria el mapa empieza vacío, así que la etapa 1 no cambia el h1.

```ts
async sectorMessage(slug: string) {
  return messages.get(slug) ?? null;
}
```

Si el valor existe, `/{sector}` usa `headline` como h1 y pinta:

```tsx
<p data-testid="mensaje-sector">{message.body}</p>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/memory-directory.test.ts && npm run test:e2e -- e2e/landing.spec.ts`

Expected: PASS. `/automotriz-y-autopartes` conserva el h1 de la home.

- [ ] **Step 5: Commit**

```bash
git add src/lib/directory.ts src/lib/memory-directory.ts src/lib/memory-directory.test.ts src/app/[sector]/page.tsx
git commit -m "test: el mensaje del sector solo aparece cuando ya está escrito"
```

---

### Task 10: Directory contra las tablas de Supabase

**Files:**
- Create: `supabase/migrations/<timestamp>_profile_email.sql` con `supabase migration new profile_email`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase-directory.ts`
- Create: `src/lib/supabase-directory.test.ts`
- Modify: `src/lib/memory-directory.ts`

Playwright no se toca. Esta tarea no llama a la red.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createSupabaseDirectory } from "./supabase-directory";

describe("supabase directory", () => {
  it("encuentra la cuenta y no la invitación con el mismo correo", async () => {
    const rows = [
      { id: "org-row", email: "ana@norte.mx", role: "empresario", onboarded_at: null, org_id: "camara" },
      { id: "acc", email: "ana@norte.mx", role: "empresario", onboarded_at: null, org_id: null },
    ];
    const client = {
      from() {
        return {
          select() {
            return {
              is(_column: string, _value: null) {
                return {
                  eq(_emailColumn: string, email: string) {
                    return {
                      maybeSingle: async () => ({
                        data: rows.find((row) => row.email === email && row.org_id === null) ?? null,
                      }),
                    };
                  },
                };
              },
            };
          },
        };
      },
    };
    const directory = createSupabaseDirectory(client as never);
    expect(await directory.findByEmail(" ANA@norte.mx ")).toEqual({
      id: "acc",
      role: "empresario",
      onboarded: false,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/supabase-directory.test.ts`

Expected: FAIL. No existe el módulo.

- [ ] **Step 3: Write minimal implementation**

Migración:

```sql
alter table public.profiles
  add column email text;

alter table public.profiles
  add constraint profiles_email_lowercase check (email is null or email = lower(email)),
  add constraint profiles_email_shape check (
    email is null or email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  );

create unique index profiles_email_key on public.profiles (email) where email is not null;
```

Aplicarla en LevantamientoDeNecesidades. El correo de la contraseña sigue en `auth.users`. `profiles.email` es la copia que el directory consulta.

```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
```

`findByEmail` normaliza el correo y filtra `org_id` nulo. En `profiles` no hay `org_id` de invitación: las invitaciones están en `crm_contacts`. La query es `.eq("email", email).maybeSingle()`.

`getDirectory()` regresa `createSupabaseDirectory(createSupabaseAdmin())` solo cuando `DIRECTORY=supabase`.

Cada método que se agregue después lleva su aserción en `supabase-directory.test.ts` antes del código. El mapa es:

| Método | Tabla |
| --- | --- |
| `createAccount` | `profiles` |
| `completeOnboarding` | `companies` o `organizations`, más `profiles.onboarded_at` |
| `saveAnswer` / `answersFor` | `response_choices` |
| `importInvites` | `crm_contacts` y `crm_events` |
| `crm` / `applyCrm` | `crm_contacts` y `crm_events` |
| `copyEventLink` / `brandForToken` | `link_copies`, `openRef`, `organizations`, `media_assets` |
| `sectorMessage` | `sector_pages` |
| `conversion` | `event_conversion` |
| `scanQr` | `passes`, `arrivals`, `crm_events` |
| `sendOpenInnovation` / `outbox` | `outbox_messages` |
| `progress` | `methodology_progress` |

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/supabase-directory.test.ts && npm test`

Expected: PASS. La suite completa sigue en memoria.

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase src/lib/supabase-directory.ts src/lib/supabase-directory.test.ts src/lib/memory-directory.ts supabase/migrations
git commit -m "test: el directory de Supabase resuelve la cuenta por correo"
```

---

### Task 11: Logo y QR en Storage

**Files:**
- Create: `src/lib/storage-assets.ts`
- Test: `src/lib/storage-assets.test.ts`

El e2e de onboarding sigue en memoria y no sube al bucket.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { logoObjectPath, passObjectPath } from "./storage-assets";

const id = "11111111-1111-4111-8111-111111111111";

describe("storage paths", () => {
  it("el logo solo usa el id del organismo y una extensión permitida", () => {
    expect(logoObjectPath(id, "image/png")).toBe(`${id}/logo.png`);
    expect(logoObjectPath(id, "image/jpeg")).toBe(`${id}/logo.jpg`);
    expect(() => logoObjectPath(id, "image/svg+xml")).toThrow("tipo de imagen no permitido");
  });

  it("el pase es un png del perfil", () => {
    expect(passObjectPath(id)).toBe(`${id}/pass.png`);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/storage-assets.test.ts`

Expected: FAIL. No existe el módulo.

- [ ] **Step 3: Write minimal implementation**

```ts
const logoExt: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export function logoObjectPath(organizationId: string, contentType: string) {
  const ext = logoExt[contentType];
  if (!ext) throw new Error("tipo de imagen no permitido");
  return `${organizationId}/logo.${ext}`;
}

export function passObjectPath(profileId: string) {
  return `${profileId}/pass.png`;
}
```

Cuando `DIRECTORY=supabase`, `completeOnboarding` del organismo sube el archivo a `organization-logos` con `upsert: true` y crea la fila `media_assets`. El pase se sube a `pass-images` solo después de `onboarded_at`. En memoria no se llama a Storage.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/storage-assets.test.ts && npm run test:e2e -- e2e/onboarding.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage-assets.ts src/lib/storage-assets.test.ts
git commit -m "test: el logo y el pase usan las rutas del bucket"
```

---

### Task 12: Tres correos en la bandeja

**Files:**
- Create: `src/lib/outbox-message.ts`
- Modify: `src/lib/memory-directory.ts`
- Test: `src/lib/outbox-message.test.ts`
- Test: `src/lib/desk.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { mailFor } from "./outbox-message";

describe("mailFor", () => {
  it("arma los tres correos de la planeación", () => {
    expect(mailFor("password", "ana@norte.mx").subject).toBe("Crea tu contraseña para la sesión");
    expect(mailFor("event_pass", "ana@norte.mx").subject).toBe("Tu pase para la sesión ya está listo");
    expect(mailFor("open_innovation", "ana@norte.mx").subject).toBe(
      "¿Quieres ser una empresa de innovación abierta?",
    );
  });

  it("no arma un correo sin destinatario", () => {
    expect(() => mailFor("password", " ")).toThrow("correo inválido");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/outbox-message.test.ts`

Expected: FAIL. No existe el módulo.

- [ ] **Step 3: Write minimal implementation**

```ts
const subjects = {
  password: "Crea tu contraseña para la sesión",
  event_pass: "Tu pase para la sesión ya está listo",
  open_innovation: "¿Quieres ser una empresa de innovación abierta?",
} as const;

export function mailFor(kind: keyof typeof subjects, email: string) {
  const to = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error("correo inválido");
  return { kind, to, subject: subjects[kind] };
}
```

`importInvites` encola `password` por cada fila nueva. `completeOnboarding` de un empresario encola `event_pass`. `sendOpenInnovation` encola `open_innovation` solo a quien ya terminó el perfil.

En `desk.test.ts`, la expectativa del aviso masivo filtra por el asunto «¿Quieres ser una empresa de innovación abierta?». No exige que ese sea el único correo si la prueba también cargó invitaciones.

No abrir SMTP.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/outbox-message.test.ts src/lib/desk.test.ts src/lib/memory-directory.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/outbox-message.ts src/lib/outbox-message.test.ts src/lib/memory-directory.ts src/lib/desk.test.ts
git commit -m "test: la bandeja distingue contraseña, pase e innovación abierta"
```

---

### Task 13: Alta pública sin rol de staff

**Files:**
- Create: `src/lib/supabase/auth.ts`
- Modify: `src/lib/account-actions.ts`
- Test: `src/lib/supabase/auth.test.ts`
- Test: `e2e/onboarding.spec.ts` sigue en memoria

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { roleForSignup } from "./auth";

describe("roleForSignup", () => {
  it("el alta pública solo puede ser empresario o director", () => {
    expect(roleForSignup("empresario")).toBe("empresario");
    expect(roleForSignup("director")).toBe("director");
    expect(roleForSignup("superadmin")).toBe("empresario");
    expect(roleForSignup("moderador")).toBe("empresario");
    expect(roleForSignup("capturista")).toBe("empresario");
    expect(roleForSignup("invitador")).toBe("empresario");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/supabase/auth.test.ts`

Expected: FAIL. No existe el módulo.

- [ ] **Step 3: Write minimal implementation**

```ts
export function roleForSignup(requested: string) {
  if (requested === "director") return "director";
  return "empresario";
}
```

Con `DIRECTORY=supabase`, `createAccountAction` hace `auth.signUp` y inserta `profiles` con ese rol y el email en minúsculas. `capturista`, `invitador`, `moderador` y `superadmin` no salen de este formulario.

Con `DIRECTORY=memory`, la acción actual no cambia. El e2e de onboarding sigue creando la cuenta en memoria.

No crear tablas `organismo` ni `gobierno`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/supabase/auth.test.ts && npm run test:e2e -- e2e/onboarding.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/auth.ts src/lib/supabase/auth.test.ts src/lib/account-actions.ts
git commit -m "test: el alta pública no puede elegir un rol de staff"
```

---

## Cobertura de la tabla

| Fila que estaba abierta | Task |
| --- | --- |
| Aviso en la metodología | 1 |
| Reintento si falla el guardado | 2 |
| Cuestionario completo | 3 |
| Contactar y rechazar | 4 |
| Confirmar y registrar | 5 |
| Invitación a mano | 6 |
| Enlace visible y marca en la landing | 7 |
| Panel del moderador | 8 |
| Mensaje distinto por sector | 9 |
| Supabase como base | 10 |
| Logo y QR en Storage | 11 |
| Correo de contraseña, pase e innovación abierta | 12 |
| Auth, sin el plan de roles del 15 de octubre | 13 |
| Analítica, conexiones, reporte `v`/CSV | Sin task |

## Cierre de la suite

Después de la Task 13:

```bash
npm test && npm run test:e2e
```

Expected: la suite de memoria sigue en verde. Ningún e2e requiere `DIRECTORY=supabase`.
