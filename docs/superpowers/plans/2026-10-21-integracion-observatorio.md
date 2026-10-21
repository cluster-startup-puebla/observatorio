# Integración del Observatorio — plan por etapas

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar el Observatorio integrable por etapas. Cada etapa termina con pruebas verdes y un e2e que se puede correr solo, antes de abrir la siguiente.

**Architecture:** Las reglas de negocio viven en funciones puras bajo `src/lib`. La UI solo las llama. Un `Directory` esconde la persistencia: en e2e es memoria compartida del proceso; Supabase entra detrás de la misma interfaz. La landing de esta integración es una sola. `/{sector}` identifica el sector y no cambia el mensaje.

**Tech Stack:** Next.js 16.4.1, React 19, TypeScript, Vitest, Playwright, Supabase (Storage y Postgres detrás del `Directory`).

**Concepto:** `docs/planeacion-funcionalidad.md`. **Reglas de código:** `docs/componentes.md`.

---

## Cómo se integra

No se abre la etapa siguiente si el e2e de la actual falla.

| Etapa | Qué queda funcionando | Prueba que cierra |
| --- | --- | --- |
| 0 | El repo corre unitarias y e2e | `e2e/smoke.spec.ts` |
| 1 | Dominio puro, sin pantalla | `npm test` |
| 2 | Landing genérica y ruta de sector | `e2e/landing.spec.ts` |
| 3 | Cuenta y onboarding de empresario y organismo | `e2e/onboarding.spec.ts` |
| 4 | Excel, CRM, enlace cifrado y conversión | `e2e/crm.spec.ts` |
| 5 | Metodología que guarda al contestar, panel y diagnóstico | `e2e/metodologia.spec.ts` |
| 6 | QR, mesa de registro y correo de innovación abierta | `e2e/mesa.spec.ts` |

Fuera de este plan: mensaje distinto por sector, contenido de analítica, módulo de conexiones y el reporte `v`/CSV.

## Decisiones que este plan deja fijas

Sirven para que las pruebas no dependan de una respuesta pendiente.

- El moderador solo escanea en la mesa.
- El director edita marca, carga Excel, invita, copia el enlace y ve el CRM.
- El capturista carga Excel, crea invitaciones y ve el CRM. No edita la marca ni copia el enlace.
- Quien invita crea invitaciones, copia el enlace y ve el CRM. No carga Excel ni edita la marca.
- El empresario solo contesta la metodología.
- El superadmin puede todo, incluido el correo masivo.
- **Llegó** solo lo prende el escaneo del QR en la mesa, y solo si la persona ya está **registrada**.
- El QR se crea al terminar el onboarding, no al poner la contraseña.
- El Excel trae `nombre`, `empresa`, `correo`.
- El diagnóstico de esta integración usa Bronce, Plata y Oro del ejercicio anterior.

## Mapa de archivos

| Archivo | Responsabilidad |
| --- | --- |
| `src/lib/access.ts` | Quién puede hacer qué. |
| `src/lib/crm-status.ts` | Transición de estatus. |
| `src/lib/sectors.ts` | Catálogo y resolución del sector. |
| `src/lib/ref-token.ts` | Cifrado del par `ref={organismo}`. Solo servidor. |
| `src/lib/invite-sheet.ts` | Lectura de la plantilla. |
| `src/lib/methodology/instrument.ts` | Las 18 preguntas placeholder. |
| `src/lib/methodology/score.ts` | Puntaje, nivel, riesgo y reto. |
| `src/lib/directory.ts` | Contrato de persistencia. |
| `src/lib/memory-directory.ts` | Adaptador del e2e, en `globalThis`. |
| `e2e/*.spec.ts` | Recorridos de cada etapa. |
| `src/**/*.test.ts` | Pruebas de las funciones puras. |

Un componente que pase de 120 líneas se parte, como pide `docs/componentes.md`.

---

## Etapa 0 — Arnés

**Criterio de aceptación:** `npm test` y `npm run test:e2e` existen y el humo abre la home actual.

### Task 0.1: Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/smoke.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Escribir la prueba que falla**

```ts
import { describe, expect, it } from "vitest";

describe("arnés", () => {
  it("corre vitest", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 2: Correrla y ver que falla**

Run: `npx vitest run src/lib/smoke.test.ts`

Expected: el comando no existe o no encuentra `vitest`.

- [ ] **Step 3: Instalar y configurar**

Run: `npm install -D vitest`

`vitest.config.ts`:

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

En `package.json`, script `"test": "vitest run"`.

- [ ] **Step 4: Correrla y ver que pasa**

Run: `npm test`

Expected: PASS, 1 test.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/smoke.test.ts
git commit -m "test: agrega vitest al observatorio"
```

### Task 0.2: Playwright

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/smoke.spec.ts`
- Modify: `package.json`

- [ ] **Step 1: Escribir el e2e**

```ts
import { expect, test } from "@playwright/test";

test("la home carga el título del observatorio", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Lo que Puebla no sabe que necesita, tu empresa puede decirlo primero.",
    }),
  ).toBeVisible();
});
```

- [ ] **Step 2: Correrlo y ver que falla**

Run: `npx playwright test e2e/smoke.spec.ts`

Expected: falla porque Playwright no está instalado.

- [ ] **Step 3: Instalar**

Run: `npm install -D @playwright/test && npx playwright install chromium`

`playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  use: { baseURL: "http://127.0.0.1:3000" },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    env: { DIRECTORY: "memory" },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

Script `"test:e2e": "playwright test"`.

- [ ] **Step 4: Correrlo y ver que pasa**

Run: `npm run test:e2e -- e2e/smoke.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json playwright.config.ts e2e/smoke.spec.ts
git commit -m "test: agrega el e2e de humo de la home"
```

---

## Etapa 1 — Dominio

**Criterio de aceptación:** `npm test` pasa sin levantar Next. Ningún archivo de `src/lib` en esta etapa importa React.

### Task 1.1: Permisos

**Files:**
- Create: `src/lib/access.ts`
- Test: `src/lib/access.test.ts`

- [ ] **Step 1: Escribir la prueba que falla**

```ts
import { describe, expect, it } from "vitest";
import { can, type Action, type Role } from "./access";

const roles: Role[] = [
  "superadmin",
  "moderador",
  "empresario",
  "director",
  "capturista",
  "invitador",
];

describe("can", () => {
  it("el superadmin puede todo", () => {
    const actions: Action[] = [
      "manage_all",
      "desk_scan",
      "edit_brand",
      "upload_excel",
      "create_invite",
      "copy_link",
      "view_crm",
      "send_mass_email",
      "answer_methodology",
    ];
    for (const action of actions) expect(can("superadmin", action)).toBe(true);
  });

  it("el moderador solo escanea en la mesa", () => {
    expect(can("moderador", "desk_scan")).toBe(true);
    expect(can("moderador", "view_crm")).toBe(false);
    expect(can("moderador", "send_mass_email")).toBe(false);
  });

  it("el empresario solo contesta la metodología", () => {
    expect(can("empresario", "answer_methodology")).toBe(true);
    expect(can("empresario", "view_crm")).toBe(false);
  });

  it("separa el trabajo dentro del organismo", () => {
    expect(can("director", "edit_brand")).toBe(true);
    expect(can("director", "upload_excel")).toBe(true);
    expect(can("director", "copy_link")).toBe(true);
    expect(can("capturista", "upload_excel")).toBe(true);
    expect(can("capturista", "copy_link")).toBe(false);
    expect(can("capturista", "edit_brand")).toBe(false);
    expect(can("invitador", "copy_link")).toBe(true);
    expect(can("invitador", "create_invite")).toBe(true);
    expect(can("invitador", "upload_excel")).toBe(false);
    expect(can("invitador", "edit_brand")).toBe(false);
  });

  it("un rol desconocido no puede nada", () => {
    expect(can("visitante" as Role, "view_crm")).toBe(false);
    expect(roles).toHaveLength(6);
  });
});
```

- [ ] **Step 2: Correrla y ver que falla**

Run: `npx vitest run src/lib/access.test.ts`

Expected: FAIL, no existe `./access`.

- [ ] **Step 3: Implementar el mínimo**

```ts
export type Role =
  | "superadmin"
  | "moderador"
  | "empresario"
  | "director"
  | "capturista"
  | "invitador";

export type Action =
  | "manage_all"
  | "desk_scan"
  | "edit_brand"
  | "upload_excel"
  | "create_invite"
  | "copy_link"
  | "view_crm"
  | "send_mass_email"
  | "answer_methodology";

const grants: Record<Role, Action[]> = {
  superadmin: [
    "manage_all",
    "desk_scan",
    "edit_brand",
    "upload_excel",
    "create_invite",
    "copy_link",
    "view_crm",
    "send_mass_email",
    "answer_methodology",
  ],
  moderador: ["desk_scan"],
  empresario: ["answer_methodology"],
  director: ["edit_brand", "upload_excel", "create_invite", "copy_link", "view_crm"],
  capturista: ["upload_excel", "create_invite", "view_crm"],
  invitador: ["create_invite", "copy_link", "view_crm"],
};

export function can(role: Role, action: Action): boolean {
  return grants[role]?.includes(action) ?? false;
}
```

- [ ] **Step 4: Correrla y ver que pasa**

Run: `npx vitest run src/lib/access.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/access.ts src/lib/access.test.ts
git commit -m "test: fija los permisos de cada rol"
```

### Task 1.2: Estatus del CRM

**Files:**
- Create: `src/lib/crm-status.ts`
- Test: `src/lib/crm-status.test.ts`

- [ ] **Step 1: Escribir la prueba que falla**

```ts
import { describe, expect, it } from "vitest";
import { applyCrmEvent } from "./crm-status";

describe("applyCrmEvent", () => {
  it("una carga abre en cargado", () => {
    expect(applyCrmEvent(null, "cargar")).toEqual({ ok: true, status: "cargado" });
  });

  it("avanza por los hechos y llegar exige registrado", () => {
    const confirmed = applyCrmEvent("cargado", "confirmar");
    const registered = applyCrmEvent("confirmo", "registrar");
    const arrived = applyCrmEvent("registrado", "llegar");
    expect(confirmed).toEqual({ ok: true, status: "confirmo" });
    expect(registered).toEqual({ ok: true, status: "registrado" });
    expect(arrived).toEqual({ ok: true, status: "llego" });
    expect(applyCrmEvent("cargado", "llegar")).toEqual({
      ok: false,
      status: "cargado",
      reason: "transición inválida",
    });
  });

  it("contactar es opcional y no se puede después de confirmar", () => {
    expect(applyCrmEvent("cargado", "contactar")).toEqual({
      ok: true,
      status: "contactado",
    });
    expect(applyCrmEvent("confirmo", "contactar").ok).toBe(false);
  });

  it("rechazar apaga el recorrido y llegar no se revierte", () => {
    expect(applyCrmEvent("registrado", "rechazar")).toEqual({ ok: true, status: "no" });
    expect(applyCrmEvent("llego", "rechazar")).toEqual({
      ok: false,
      status: "llego",
      reason: "transición inválida",
    });
    expect(applyCrmEvent("no", "confirmar").ok).toBe(false);
  });
});
```

- [ ] **Step 2: Correrla y ver que falla**

Run: `npx vitest run src/lib/crm-status.test.ts`

Expected: FAIL, no existe `./crm-status`.

- [ ] **Step 3: Implementar el mínimo**

```ts
export type CrmStatus = "cargado" | "contactado" | "confirmo" | "registrado" | "llego" | "no";

export type CrmEvent = "cargar" | "contactar" | "confirmar" | "registrar" | "llegar" | "rechazar";

const allowed: Record<CrmStatus, CrmEvent[]> = {
  cargado: ["contactar", "confirmar", "rechazar"],
  contactado: ["confirmar", "rechazar"],
  confirmo: ["registrar", "rechazar"],
  registrado: ["llegar", "rechazar"],
  llego: [],
  no: [],
};

const produced: Record<Exclude<CrmEvent, "cargar">, CrmStatus> = {
  contactar: "contactado",
  confirmar: "confirmo",
  registrar: "registrado",
  llegar: "llego",
  rechazar: "no",
};

export function applyCrmEvent(
  status: CrmStatus | null,
  event: CrmEvent,
): { ok: true; status: CrmStatus } | { ok: false; status: CrmStatus | null; reason: string } {
  if (event === "cargar") {
    if (status) return { ok: false, status, reason: "transición inválida" };
    return { ok: true, status: "cargado" };
  }
  if (!status || !allowed[status].includes(event)) {
    return { ok: false, status, reason: "transición inválida" };
  }
  return { ok: true, status: produced[event] };
}
```

- [ ] **Step 4: Correrla y ver que pasa**

Run: `npx vitest run src/lib/crm-status.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/crm-status.ts src/lib/crm-status.test.ts
git commit -m "test: el estatus del CRM solo cambia con un hecho válido"
```

### Task 1.3: Sector

**Files:**
- Create: `src/lib/sectors.ts`
- Test: `src/lib/sectors.test.ts`

El catálogo visible es el de `src/content/diagnostico-tmec.ts` (`diagnosticIndustries`). El slug es el nombre en minúsculas, sin acentos, con guiones.

- [ ] **Step 1: Escribir la prueba que falla**

```ts
import { describe, expect, it } from "vitest";
import { resolveSector, sectorSlug, sectors } from "./sectors";

describe("sectors", () => {
  it("publica el catálogo con slug estable", () => {
    expect(sectors.map((sector) => sector.slug)).toContain("automotriz-y-autopartes");
    expect(sectorSlug("Textil y confección")).toBe("textil-y-confeccion");
  });

  it("una ruta conocida deja el sector seleccionado y bloqueado", () => {
    expect(resolveSector({ pathSector: "alimentos-y-bebidas" })).toEqual({
      slug: "alimentos-y-bebidas",
      name: "Alimentos y bebidas",
      locked: true,
    });
  });

  it("una ruta desconocida no inventa sector", () => {
    expect(resolveSector({ pathSector: "no-existe" })).toEqual({
      slug: null,
      name: null,
      locked: false,
    });
  });

  it("sin ruta, usa la elección si está en el catálogo", () => {
    expect(resolveSector({ chosen: "turismo" })).toEqual({
      slug: "turismo",
      name: "Turismo",
      locked: false,
    });
  });
});
```

- [ ] **Step 2: Correrla y ver que falla**

Run: `npx vitest run src/lib/sectors.test.ts`

Expected: FAIL, no existe `./sectors`.

- [ ] **Step 3: Implementar el mínimo**

```ts
import { diagnosticIndustries } from "@/content/diagnostico-tmec";

export function sectorSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const sectors = diagnosticIndustries.map((name) => ({
  name,
  slug: sectorSlug(name),
}));

export function resolveSector(input: { pathSector?: string; chosen?: string }): {
  slug: string | null;
  name: string | null;
  locked: boolean;
} {
  const fromPath = sectors.find((sector) => sector.slug === input.pathSector);
  if (input.pathSector) {
    return fromPath
      ? { slug: fromPath.slug, name: fromPath.name, locked: true }
      : { slug: null, name: null, locked: false };
  }
  const chosen = sectors.find((sector) => sector.slug === input.chosen);
  return chosen
    ? { slug: chosen.slug, name: chosen.name, locked: false }
    : { slug: null, name: null, locked: false };
}
```

- [ ] **Step 4: Correrla y ver que pasa**

Run: `npx vitest run src/lib/sectors.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/sectors.ts src/lib/sectors.test.ts
git commit -m "test: resuelve el sector desde la ruta o la elección"
```

### Task 1.4: Enlace cifrado

**Files:**
- Create: `src/lib/ref-token.ts`
- Test: `src/lib/ref-token.test.ts`

- [ ] **Step 1: Escribir la prueba que falla**

```ts
import { describe, expect, it } from "vitest";
import { openRef, sealRef } from "./ref-token";

const secret = "secreto-de-prueba";

describe("ref token", () => {
  it("oculta el organismo y no usa la clave ref", () => {
    const token = sealRef("canacintra", secret);
    expect(token.includes("canacintra")).toBe(false);
    expect(token.startsWith("ref=")).toBe(false);
    expect(openRef(token, secret)).toBe("canacintra");
  });

  it("un token alterado no se atribuye", () => {
    const token = sealRef("canacintra", secret);
    const tampered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;
    expect(openRef(tampered, secret)).toBeNull();
  });

  it("otro secreto no abre el token", () => {
    expect(openRef(sealRef("cce", secret), "otro-secreto")).toBeNull();
  });
});
```

- [ ] **Step 2: Correrla y ver que falla**

Run: `npx vitest run src/lib/ref-token.test.ts`

Expected: FAIL, no existe `./ref-token`.

- [ ] **Step 3: Implementar el mínimo**

El módulo cifra el id del organismo con AES-256-GCM. La URL pública es `/{sector}?{token}`. No lleva la clave `ref`.

```ts
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function key(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

export function sealRef(orgId: string, secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(secret), iv);
  const ciphertext = Buffer.concat([cipher.update(orgId, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64url");
}

export function openRef(token: string, secret: string): string | null {
  try {
    const buf = Buffer.from(token, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", key(secret), buf.subarray(0, 12));
    decipher.setAuthTag(buf.subarray(12, 28));
    return Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Correrla y ver que pasa**

Run: `npx vitest run src/lib/ref-token.test.ts`

Expected: PASS. El token no empieza con `ref=` y no contiene el id en claro.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ref-token.ts src/lib/ref-token.test.ts
git commit -m "test: cifra el par completo del enlace de invitación"
```

### Task 1.5: Plantilla de Excel

**Files:**
- Create: `src/lib/invite-sheet.ts`
- Test: `src/lib/invite-sheet.test.ts`

- [ ] **Step 1: Escribir la prueba que falla**

```ts
import { describe, expect, it } from "vitest";
import { inviteTemplateCsv, parseInviteSheet } from "./invite-sheet";

describe("parseInviteSheet", () => {
  it("entrega la plantilla con tres columnas", () => {
    expect(inviteTemplateCsv()).toBe("nombre,empresa,correo\n");
  });

  it("acepta filas completas y rechaza el resto", () => {
    const result = parseInviteSheet([
      ["nombre", "empresa", "correo"],
      ["Ana López", "Talleres Norte", "ana@norte.mx"],
      ["", "Sin nombre", "vacio@norte.mx"],
      ["Beto Ruiz", "Ruiz", "no-es-correo"],
      ["Ana otra", "Otra", "ana@norte.mx"],
    ]);
    expect(result.ok).toEqual([
      { nombre: "Ana López", empresa: "Talleres Norte", correo: "ana@norte.mx" },
    ]);
    expect(result.errors.map((error) => error.reason)).toEqual([
      "nombre, empresa y correo son obligatorios",
      "correo inválido",
      "correo repetido",
    ]);
  });

  it("rechaza un encabezado distinto", () => {
    expect(parseInviteSheet([["email", "name"]]).ok).toEqual([]);
    expect(parseInviteSheet([["email", "name"]]).errors[0].row).toBe(1);
  });
});
```

- [ ] **Step 2: Correrla y ver que falla**

Run: `npx vitest run src/lib/invite-sheet.test.ts`

Expected: FAIL, no existe `./invite-sheet`.

- [ ] **Step 3: Implementar el mínimo**

```ts
export type InviteRow = { nombre: string; empresa: string; correo: string };
export type InviteRowError = { row: number; reason: string };

const header = ["nombre", "empresa", "correo"];

export function inviteTemplateCsv(): string {
  return `${header.join(",")}\n`;
}

export function parseInviteSheet(rows: string[][]): { ok: InviteRow[]; errors: InviteRowError[] } {
  const head = (rows[0] ?? []).map((cell) => cell.trim().toLowerCase());
  if (head.join(",") !== header.join(",")) {
    return { ok: [], errors: [{ row: 1, reason: "el encabezado debe ser nombre, empresa, correo" }] };
  }
  const ok: InviteRow[] = [];
  const errors: InviteRowError[] = [];
  const seen = new Set<string>();
  rows.slice(1).forEach((cells, index) => {
    const row = index + 2;
    const nombre = cells[0]?.trim() ?? "";
    const empresa = cells[1]?.trim() ?? "";
    const correo = (cells[2]?.trim() ?? "").toLowerCase();
    if (!nombre || !empresa || !correo) {
      errors.push({ row, reason: "nombre, empresa y correo son obligatorios" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      errors.push({ row, reason: "correo inválido" });
      return;
    }
    if (seen.has(correo)) {
      errors.push({ row, reason: "correo repetido" });
      return;
    }
    seen.add(correo);
    ok.push({ nombre, empresa, correo });
  });
  return { ok, errors };
}
```

- [ ] **Step 4: Correrla y ver que pasa**

Run: `npx vitest run src/lib/invite-sheet.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/invite-sheet.ts src/lib/invite-sheet.test.ts
git commit -m "test: valida la plantilla de invitaciones"
```

### Task 1.6: Diagnóstico placeholder

**Files:**
- Create: `src/lib/methodology/instrument.ts`
- Create: `src/lib/methodology/score.ts`
- Test: `src/lib/methodology/score.test.ts`

Copiar las preguntas, los puntos y los rangos desde `cluster/evaluaicon/b_jUnBItwQhuJ/lib/evaluation-data.ts` y la fórmula desde `evaluation-calculator.ts`. Son 18 preguntas. `a=1`, `b=2`, `c=4`, `d=6`. La pregunta de prioridad suma la severidad de lo que quedó en rango 1: `falta_materiales=6`, `fallas_mecanicas=4`, `personal=2`, `set_ups_lentos=1`.

- [ ] **Step 1: Escribir la prueba que falla**

```ts
import { describe, expect, it } from "vitest";
import { SECTIONS } from "./instrument";
import { calculateIntegralResult } from "./score";

function answersFor(single: "a" | "d", top: string) {
  const answers: Record<number, string | Record<string, number>> = {};
  for (const section of SECTIONS) {
    for (const question of section.questions) {
      answers[question.id] =
        question.type === "priority"
          ? { [top]: 1, fallas_mecanicas: 2, personal: 3, set_ups_lentos: 4 }
          : single;
    }
  }
  return answers;
}

describe("calculateIntegralResult", () => {
  it("carga las cuatro secciones del ejercicio anterior", () => {
    expect(SECTIONS.map((section) => section.id)).toEqual([
      "infraestructura",
      "equipo_productivo",
      "financiera",
      "operacion",
    ]);
  });

  it("el máximo es Oro con 108 puntos", () => {
    const result = calculateIntegralResult(answersFor("d", "falta_materiales"));
    expect(result.totalScore).toBe(108);
    expect(result.category).toBe("Oro");
    expect(result.sections.every((section) => section.category === "Oro")).toBe(true);
  });

  it("el piso de 18 puntos es Bronce", () => {
    const result = calculateIntegralResult(answersFor("a", "set_ups_lentos"));
    expect(result.totalScore).toBe(18);
    expect(result.category).toBe("Bronce");
    expect(result.riesgo.length).toBeGreaterThan(0);
    expect(result.reto.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Correrla y ver que falla**

Run: `npx vitest run src/lib/methodology/score.test.ts`

Expected: FAIL, no existe `./instrument`.

- [ ] **Step 3: Portar instrumento y calculadora**

`instrument.ts` exporta `SECTIONS`, `ANSWER_POINTS`, `PRIORITY_SEVERITY`, `SECTION_RANGES`, `INTEGRAL_RANGES`, `SECTION_PROFILES` e `INTEGRAL_PROFILES` con los mismos valores del ejercicio anterior.

`score.ts` exporta `calculateIntegralResult` con la misma firma que `evaluation-calculator.ts`: cada sección regresa `sectionId`, `sectionName`, `score`, `maxScore`, `category`, `riesgo`, `reto`. El integral regresa `sections`, `totalScore`, `maxScore: 108`, `category`, `riesgo`, `reto`. Un puntaje fuera de rango queda en `Sin categoría`.

- [ ] **Step 4: Correrla y ver que pasa**

Run: `npx vitest run src/lib/methodology/score.test.ts`

Expected: PASS. `npm test` sigue en verde.

- [ ] **Step 5: Commit**

```bash
git add src/lib/methodology/instrument.ts src/lib/methodology/score.ts src/lib/methodology/score.test.ts
git commit -m "test: porta el diagnóstico Bronce Plata Oro del ejercicio anterior"
```

---

## Etapa 2 — Landing genérica

**Criterio de aceptación:** en `/` se ven objetivo, evento, temas, VIA Partners y los sectores. `/automotriz-y-autopartes` muestra el mismo contenido y el sector queda seleccionado. Un slug inexistente no muestra un sector inventado.

### Task 2.1: E2E de la landing

**Files:**
- Create: `e2e/landing.spec.ts`
- Modify: `src/app/page.tsx`
- Modify: `src/components/landing/sections/hero.tsx`
- Modify: `src/components/landing/sections/session.tsx`
- Modify: `src/components/landing/sections/diagnostic-banner.tsx`
- Create: `src/components/landing/sections/topics.tsx`
- Create: `src/components/landing/sections/sectors.tsx`
- Create: `src/app/[sector]/page.tsx`

- [ ] **Step 1: Escribir el e2e que falla**

```ts
import { expect, test } from "@playwright/test";

test("la landing muestra la estructura y los sectores", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("bloque-objetivo")).toBeVisible();
  await expect(page.getByTestId("bloque-evento")).toContainText("Quinta Real");
  await expect(page.getByTestId("bloque-temas")).toBeVisible();
  await expect(page.getByTestId("bloque-via-partners")).toContainText("VIA Partners");
  await expect(page.getByTestId("sector-automotriz-y-autopartes")).toHaveAttribute(
    "href",
    "/automotriz-y-autopartes",
  );
});

test("la ruta de un sector lo deja seleccionado", async ({ page }) => {
  await page.goto("/automotriz-y-autopartes");
  await expect(page.getByTestId("sector-seleccionado")).toHaveText("Automotriz y autopartes");
  await expect(page.getByTestId("bloque-objetivo")).toBeVisible();
});

test("un sector desconocido no se selecciona", async ({ page }) => {
  await page.goto("/sector-inventado");
  await expect(page.getByTestId("sector-seleccionado")).toHaveCount(0);
});
```

- [ ] **Step 2: Correrlo y ver que falla**

Run: `npm run test:e2e -- e2e/landing.spec.ts`

Expected: FAIL. No encuentra `bloque-objetivo`.

- [ ] **Step 3: Hacer pasar el e2e**

Poner `data-testid="bloque-objetivo"` en el hero. Poner `data-testid="bloque-evento"` en la sección de la sesión, que ya contiene Quinta Real. Poner `data-testid="bloque-via-partners"` en el banner y el texto `VIA Partners`. Crear `topics.tsx` con `data-testid="bloque-temas"` y los cuatro nombres de la metodología: Infraestructura y digitalización, Situación del equipo productivo, Gestión financiera y costos, Operación, paros y calidad. Crear `sectors.tsx` que renderiza `sectors` de `src/lib/sectors.ts`; cada enlace lleva `data-testid={"sector-" + slug}` y `href={"/" + slug}`.

`src/app/[sector]/page.tsx` llama `resolveSector({ pathSector })`. Si hay nombre, muestra `<p data-testid="sector-seleccionado">{name}</p>` y las mismas secciones. Si `slug` es null, no renderiza ese párrafo. Esta ruta no es una landing con otro mensaje.

- [ ] **Step 4: Correrlo y ver que pasa**

Run: `npm run test:e2e -- e2e/landing.spec.ts`

Expected: PASS. `npm test` sigue en verde.

- [ ] **Step 5: Commit**

```bash
git add e2e/landing.spec.ts src/app/page.tsx src/app/[sector]/page.tsx src/components/landing/sections
git commit -m "test: la landing genérica lista los sectores"
```

---

## Etapa 3 — Cuentas y onboarding

**Criterio de aceptación:** empresario y director crean cuenta, ven en cada paso que la información es solo estadística, y terminan el perfil. Si entraron por `/{sector}`, el sector llega elegido. El director no puede copiar el enlace hasta terminar. El logo guarda una llave de Storage, no el archivo en el HTML.

### Task 3.1: Directory en memoria

**Files:**
- Create: `src/lib/directory.ts`
- Create: `src/lib/memory-directory.ts`
- Test: `src/lib/memory-directory.test.ts`

- [ ] **Step 1: Escribir la prueba que falla**

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { getDirectory, resetDirectory } from "./memory-directory";

describe("memory directory", () => {
  beforeEach(() => resetDirectory());

  it("guarda la respuesta en el momento y la recupera", async () => {
    const directory = getDirectory();
    await directory.saveAnswer({ personId: "p1", questionId: "1", value: "a" });
    await directory.saveAnswer({ personId: "p1", questionId: "1", value: "d" });
    expect(await directory.answersFor("p1")).toEqual({ "1": "d" });
  });

  it("el onboarding incompleto no suelta el QR ni la invitación", async () => {
    const directory = getDirectory();
    await directory.createAccount({ email: "ana@norte.mx", role: "empresario" });
    const id = (await directory.findByEmail("ana@norte.mx"))!.id;
    expect(await directory.qrFor(id)).toBeNull();
    await directory.completeOnboarding(id, { sectorSlug: "turismo", size: "11–50" });
    expect(await directory.qrFor(id)).toEqual({ personId: id });
  });
});
```

- [ ] **Step 2: Correrla y ver que falla**

Run: `npx vitest run src/lib/memory-directory.test.ts`

Expected: FAIL, no existe `./memory-directory`.

- [ ] **Step 3: Implementar el contrato**

`directory.ts` define:

```ts
export type AccountRole = "empresario" | "director" | "capturista" | "invitador" | "superadmin" | "moderador";

export interface Directory {
  createAccount(input: { email: string; role: AccountRole }): Promise<{ id: string }>;
  findByEmail(email: string): Promise<{ id: string; role: AccountRole; onboarded: boolean } | null>;
  completeOnboarding(
    id: string,
    profile: { sectorSlug: string; size: string; name?: string; logoKey?: string },
  ): Promise<void>;
  saveAnswer(input: { personId: string; questionId: string; value: string }): Promise<void>;
  answersFor(personId: string): Promise<Record<string, string>>;
  qrFor(id: string): Promise<{ personId: string } | null>;
}
```

`memory-directory.ts` guarda todo en `globalThis.__observatorioDirectory`. `saveAnswer` hace upsert por `questionId`. `qrFor` regresa null hasta `completeOnboarding`. `getDirectory()` lee `process.env.DIRECTORY`: `memory` usa este adaptador. `resetDirectory()` borra el global para las pruebas.

- [ ] **Step 4: Correrla y ver que pasa**

Run: `npx vitest run src/lib/memory-directory.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/directory.ts src/lib/memory-directory.ts src/lib/memory-directory.test.ts
git commit -m "test: persiste perfil y respuestas en el directory de memoria"
```

### Task 3.2: E2E de onboarding

**Files:**
- Create: `e2e/onboarding.spec.ts`
- Create: `src/app/onboarding/page.tsx`
- Create: `src/components/onboarding/onboarding-wizard.tsx`
- Create: `src/components/onboarding/confidentiality-note.tsx`
- Modify: `src/app/register/page.tsx`

El aviso, en un componente propio, dice exactamente: `Esta información es solo estadística. No se comparte y es confidencial.`

- [ ] **Step 1: Escribir el e2e que falla**

```ts
import { expect, test } from "@playwright/test";

test("el empresario termina el perfil con el sector de la ruta", async ({ page }) => {
  await page.goto("/automotriz-y-autopartes");
  await page.getByRole("link", { name: "Reservar mi lugar" }).click();
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
```

- [ ] **Step 2: Correrlo y ver que falla**

Run: `npm run test:e2e -- e2e/onboarding.spec.ts`

Expected: FAIL en el primer `getByLabel("Contraseña")` o en el aviso.

- [ ] **Step 3: Hacer pasar el e2e**

Agregar `e2e/fixtures/logo.png`, un PNG de 1×1. El alta escribe en `getDirectory()` con `DIRECTORY=memory`, que Playwright ya inyecta. El sector bloqueado sale de `resolveSector` y se guarda en el perfil. El botón de copiar permanece `disabled` mientras `onboarded` sea false. Al terminar, `completeOnboarding` corre y la pantalla del empresario muestra `data-testid="qr-listo"`. El logo no se incrusta en el HTML: el adaptador guarda `logoKey` con la forma `logos/{accountId}`.

- [ ] **Step 4: Correrlo y ver que pasa**

Run: `npm run test:e2e -- e2e/onboarding.spec.ts && npm test`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add e2e/onboarding.spec.ts e2e/fixtures/logo.png src/app/onboarding src/app/register src/components/onboarding
git commit -m "test: el onboarding cierra el perfil antes del QR y de la invitación"
```

---

## Etapa 4 — CRM y enlaces

**Criterio de aceptación:** la plantilla se descarga. Una fila válida entra como `cargado`. Un correo repetido no duplica. Copiar el enlace registra la copia. Abrir `/{sector}?{token}` y terminar el alta atribuye el registro a ese organismo. Un token alterado llega sin atribución. La conversión es registros entre copias. El home del organismo muestra tres entradas y analítica dice próximamente.

### Task 4.1: Hechos del CRM en el directory

**Files:**
- Modify: `src/lib/directory.ts`
- Modify: `src/lib/memory-directory.ts`
- Test: `src/lib/crm-directory.test.ts`

- [ ] **Step 1: Escribir la prueba que falla**

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { getDirectory, resetDirectory } from "./memory-directory";

describe("crm en memoria", () => {
  beforeEach(() => resetDirectory());

  it("carga filas, atribuye el registro y calcula la conversión", async () => {
    const directory = getDirectory();
    const org = await directory.createAccount({ email: "dir@camara.mx", role: "director" });
    await directory.completeOnboarding(org.id, { sectorSlug: "turismo", size: "51–250" });
    await directory.importInvites(org.id, [
      { nombre: "Ana", empresa: "Norte", correo: "ana@norte.mx" },
    ]);
    const people = await directory.crm(org.id);
    expect(people[0].status).toBe("cargado");
    const token = await directory.copyEventLink(org.id, "turismo");
    expect(token.includes("ref=")).toBe(false);
    await directory.attributeRegistration({ token, email: "beto@sur.mx" });
    expect(await directory.conversion(org.id, "turismo")).toEqual({ copies: 1, registrations: 1 });
  });

  it("un token alterado no atribuye", async () => {
    const directory = getDirectory();
    const org = await directory.createAccount({ email: "dir@camara.mx", role: "director" });
    const token = await directory.copyEventLink(org.id, "turismo");
    const tampered = `${token}x`;
    await directory.attributeRegistration({ token: tampered, email: "nadie@sur.mx" });
    expect(await directory.conversion(org.id, "turismo")).toEqual({ copies: 1, registrations: 0 });
  });
});
```

- [ ] **Step 2: Correrla y ver que falla**

Run: `npx vitest run src/lib/crm-directory.test.ts`

Expected: FAIL. `importInvites` no existe.

- [ ] **Step 3: Implementar los métodos**

`importInvites` pasa cada fila por `parseInviteSheet` ya hecha y abre el estatus con `applyCrmEvent(null, "cargar")`. Un correo que ya existe no crea otra persona. `copyEventLink` llama `sealRef(orgId, process.env.REF_SECRET ?? "e2e-ref-secret")` y suma una copia. `attributeRegistration` llama `openRef`; si regresa null, no suma registro. `conversion` regresa `{ copies, registrations }` del organismo y el sector.

- [ ] **Step 4: Correrla y ver que pasa**

Run: `npx vitest run src/lib/crm-directory.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/directory.ts src/lib/memory-directory.ts src/lib/crm-directory.test.ts
git commit -m "test: el CRM atribuye registros solo si el enlace está intacto"
```

### Task 4.2: E2E del organismo

**Files:**
- Create: `e2e/crm.spec.ts`
- Create: `src/app/organismo/page.tsx`
- Create: `src/app/organismo/crm/page.tsx`
- Create: `src/app/organismo/analitica/page.tsx`
- Create: `src/app/organismo/invitaciones/page.tsx`

- [ ] **Step 1: Escribir el e2e que falla**

```ts
import { expect, test } from "@playwright/test";

test("el organismo carga el Excel y copia el enlace", async ({ page }) => {
  await page.goto("/register?cuenta=organismo");
  await page.getByLabel("Correo").fill("mesa@camara.mx");
  await page.getByLabel("Contraseña").fill("secreto-largo");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.getByLabel("Nombre del organismo").fill("CANACINTRA");
  await page.getByLabel("Color").fill("#1B3A5C");
  await page.getByLabel("Logo").setInputFiles("e2e/fixtures/logo.png");
  await page.getByRole("button", { name: "Terminar perfil" }).click();
  await expect(page.getByRole("link", { name: "Tablero" })).toBeVisible();
  await expect(page.getByRole("link", { name: "CRM" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Analítica" })).toBeVisible();
  await page.getByRole("link", { name: "Analítica" }).click();
  await expect(page.getByText("Próximamente")).toBeVisible();
  const download = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Descargar plantilla" }).click(),
  ]).then(([file]) => file);
  expect(download.suggestedFilename()).toBe("plantilla-invitaciones.csv");
  await page.getByLabel("Archivo de invitaciones").setInputFiles("e2e/fixtures/invitaciones.csv");
  await expect(page.getByRole("cell", { name: "ana@norte.mx" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Cargado" })).toBeVisible();
});
```

Crear `e2e/fixtures/invitaciones.csv` con encabezado y una fila: `Ana,Norte,ana@norte.mx`.

- [ ] **Step 2: Correrlo y ver que falla**

Run: `npm run test:e2e -- e2e/crm.spec.ts`

Expected: FAIL. No existe el home del organismo.

- [ ] **Step 3: Hacer pasar el e2e**

El home enlaza Tablero (`/organismo`), CRM (`/organismo/crm`) y Analítica (`/organismo/analitica`). Analítica renderiza `Próximamente`. La plantilla responde `inviteTemplateCsv()` con `Content-Disposition: attachment; filename="plantilla-invitaciones.csv"`. La carga usa `parseInviteSheet` y `importInvites`. La tabla muestra correo y el texto `Cargado`.

- [ ] **Step 4: Correrlo y ver que pasa**

Run: `npm run test:e2e -- e2e/crm.spec.ts && npm test`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add e2e/crm.spec.ts e2e/fixtures/invitaciones.csv src/app/organismo
git commit -m "test: el organismo carga invitaciones y reserva la analítica"
```

---

## Etapa 5 — Metodología

**Criterio de aceptación:** cada opción se guarda al elegirla. Recargar no la pierde. El panel del superadmin muestra el avance sin esperar al final. Al terminar, la persona ve Bronce, Plata u Oro y puede descargar el diagnóstico.

### Task 5.1: E2E de guardado en vivo

**Files:**
- Create: `e2e/metodologia.spec.ts`
- Create: `src/app/metodologia/page.tsx`
- Create: `src/components/methodology/question-step.tsx`
- Create: `src/app/panel/page.tsx`
- Create: `src/app/metodologia/diagnostico/route.ts`

- [ ] **Step 1: Escribir el e2e que falla**

```ts
import { expect, test } from "@playwright/test";

test("la respuesta sobrevive al recargar y el panel la ve", async ({ browser }) => {
  const empresario = await browser.newContext();
  const page = await empresario.newPage();
  await page.goto("/metodologia?persona=p-e2e");
  await page.getByRole("radio", { name: "Papel/Bitácoras" }).check();
  await expect(page.getByText("Guardada")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("radio", { name: "Papel/Bitácoras" })).toBeChecked();

  const admin = await browser.newContext();
  const panel = await admin.newPage();
  await panel.goto("/panel");
  await expect(panel.getByTestId("avance-p-e2e")).toContainText("1");
});

test("al cerrar las 18 preguntas se descarga el diagnóstico", async ({ page }) => {
  await page.goto("/metodologia?persona=p-cierre&completas=1");
  await page.getByRole("button", { name: "Ver diagnóstico" }).click();
  await expect(page.getByTestId("nivel-integral")).toHaveText(/Bronce|Plata|Oro/);
  const download = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Descargar diagnóstico" }).click(),
  ]).then(([file]) => file);
  expect(download.suggestedFilename()).toBe("diagnostico.txt");
});
```

`completas=1` es una semilla del adaptador de memoria para no hacer clic 18 veces en el e2e de cierre. El e2e de la primera pregunta no usa esa semilla: el clic real escribe.

- [ ] **Step 2: Correrlo y ver que falla**

Run: `npm run test:e2e -- e2e/metodologia.spec.ts`

Expected: FAIL. No existe `/metodologia`.

- [ ] **Step 3: Hacer pasar el e2e**

`question-step.tsx` pinta una pregunta de `SECTIONS`. Al cambiar el radio llama `saveAnswer` y entonces muestra `Guardada`. Al cargar, marca el valor que regresa `answersFor`. `/panel` lista `avance-{personId}` con la cantidad de respuestas. `diagnostico/route.ts` arma un texto con `calculateIntegralResult` y lo entrega como `diagnostico.txt`. El nivel visible sale de `result.category`.

- [ ] **Step 4: Correrlo y ver que pasa**

Run: `npm run test:e2e -- e2e/metodologia.spec.ts && npm test`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add e2e/metodologia.spec.ts src/app/metodologia src/app/panel src/components/methodology
git commit -m "test: la metodología guarda cada respuesta y publica el nivel"
```

---

## Etapa 6 — Mesa y correo

**Criterio de aceptación:** el QR solo existe con el onboarding terminado. Escanearlo en la mesa pone **Llegó** y saluda por nombre. Escanear a alguien que no está registrado no lo marca. El botón del superadmin deja un correo de innovación abierta en la bandeja, dirigido a quienes están registrados.

### Task 6.1: Hechos de mesa y bandeja

**Files:**
- Modify: `src/lib/directory.ts`
- Modify: `src/lib/memory-directory.ts`
- Test: `src/lib/desk.test.ts`

- [ ] **Step 1: Escribir la prueba que falla**

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { getDirectory, resetDirectory } from "./memory-directory";

describe("mesa y correo", () => {
  beforeEach(() => resetDirectory());

  it("solo quien terminó el perfil llega por QR", async () => {
    const directory = getDirectory();
    const account = await directory.createAccount({ email: "ana@norte.mx", role: "empresario" });
    expect(await directory.scanQr(account.id)).toEqual({ ok: false, reason: "sin qr" });
    await directory.completeOnboarding(account.id, { sectorSlug: "turismo", size: "1–10", name: "Ana López" });
    expect(await directory.scanQr(account.id)).toEqual({ ok: true, name: "Ana López", status: "llego" });
  });

  it("el aviso de innovación abierta sale a los registrados", async () => {
    const directory = getDirectory();
    const ready = await directory.createAccount({ email: "ana@norte.mx", role: "empresario" });
    const pending = await directory.createAccount({ email: "beto@sur.mx", role: "empresario" });
    await directory.completeOnboarding(ready.id, { sectorSlug: "turismo", size: "1–10", name: "Ana" });
    await directory.sendOpenInnovation();
    const outbox = await directory.outbox();
    expect(outbox.map((mail) => mail.to)).toEqual(["ana@norte.mx"]);
    expect(outbox[0].subject).toBe("¿Quieres ser una empresa de innovación abierta?");
    expect(outbox.some((mail) => mail.to === "beto@sur.mx")).toBe(false);
    expect(pending.id).not.toBe(ready.id);
  });
});
```

- [ ] **Step 2: Correrla y ver que falla**

Run: `npx vitest run src/lib/desk.test.ts`

Expected: FAIL. `scanQr` no existe.

- [ ] **Step 3: Implementar los métodos**

`scanQr` exige QR. Para llegar a `llego`, el estatus tiene que pasar por `applyCrmEvent`: si la persona no está `registrado`, el resultado es `{ ok: false, reason: "transición inválida" }`. `completeOnboarding` deja el estatus en `registrado`. `sendOpenInnovation` encola un correo por cada cuenta con onboarding terminado. No abre SMTP en la prueba. El envío real, con React Email y el SMTP del Clúster, lee esta misma bandeja.

- [ ] **Step 4: Correrla y ver que pasa**

Run: `npx vitest run src/lib/desk.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/directory.ts src/lib/memory-directory.ts src/lib/desk.test.ts
git commit -m "test: la mesa y el correo masivo respetan el estatus registrado"
```

### Task 6.2: E2E de la mesa

**Files:**
- Create: `e2e/mesa.spec.ts`
- Create: `src/app/mesa/page.tsx`
- Create: `src/app/admin/correo/page.tsx`

- [ ] **Step 1: Escribir el e2e que falla**

```ts
import { expect, test } from "@playwright/test";

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
```

La semilla `persona-registrada` la crea `memory-directory` cuando `DIRECTORY=memory` y el código escaneado es ese id de prueba, con nombre `Ana López` y onboarding completo. Documentarlo en el adaptador para que el e2e no dependa de un alta previa en la misma prueba.

- [ ] **Step 2: Correrlo y ver que falla**

Run: `npm run test:e2e -- e2e/mesa.spec.ts`

Expected: FAIL. `/mesa` no existe.

- [ ] **Step 3: Hacer pasar el e2e**

`/mesa` llama `scanQr` y pinta `data-testid="bienvenida"` y `data-testid="estatus"`. `/admin/correo` llama `sendOpenInnovation` y muestra la cantidad en `data-testid="encolados"`. El botón no se muestra si `can(role, "send_mass_email")` es false. En el e2e el rol de esa ruta es `superadmin`.

- [ ] **Step 4: Correrlo y ver que pasa**

Run: `npm run test:e2e -- e2e/mesa.spec.ts && npm test && npm run test:e2e`

Expected: PASS en unitarias y en los siete spec.

- [ ] **Step 5: Commit**

```bash
git add e2e/mesa.spec.ts src/app/mesa src/app/admin/correo src/lib/memory-directory.ts
git commit -m "test: la mesa de registro y el aviso masivo cierran la integración"
```

---

## Cobertura del concepto

| Pedido del concepto | Dónde se prueba |
| --- | --- |
| Landing genérica con cinco bloques | `e2e/landing.spec.ts` |
| `/{sector}` selecciona y no cambia el mensaje | `e2e/landing.spec.ts` y `sectors.test.ts` |
| Roles y permisos | `access.test.ts` |
| Onboarding de empresario y organismo | `e2e/onboarding.spec.ts` |
| Aviso de confidencialidad | `e2e/onboarding.spec.ts` |
| QR al terminar el perfil | `memory-directory.test.ts` y `e2e/onboarding.spec.ts` |
| Plantilla y Excel | `invite-sheet.test.ts` y `e2e/crm.spec.ts` |
| Estatus por hechos, Llegó solo en la mesa | `crm-status.test.ts` y `desk.test.ts` |
| Enlace cifrado y conversión | `ref-token.test.ts` y `crm-directory.test.ts` |
| Tres entradas del organismo, analítica vacía | `e2e/crm.spec.ts` |
| Guardar al contestar y panel en vivo | `e2e/metodologia.spec.ts` |
| Diagnóstico Bronce, Plata, Oro | `score.test.ts` y `e2e/metodologia.spec.ts` |
| Correo de innovación abierta | `desk.test.ts` y `e2e/mesa.spec.ts` |
| Logo en Storage | `e2e/onboarding.spec.ts` guarda `logoKey` |

## Después de esta integración

Supabase reemplaza `memory-directory` sin cambiar las pruebas de `src/lib/access.ts`, `crm-status.ts`, `sectors.ts`, `ref-token.ts`, `invite-sheet.ts` ni `methodology/score.ts`. El adaptador nuevo tiene que pasar `memory-directory.test.ts`, `crm-directory.test.ts` y `desk.test.ts` contra una base local. React Email y el SMTP del Clúster consumen la bandeja que `sendOpenInnovation` ya deja formada.
