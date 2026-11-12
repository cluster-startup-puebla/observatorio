# Detalle de organismo: miembros, enlaces y logo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Las pestañas Miembros, Enlaces y Logo del detalle de un organismo se leen como el resto del panel, y cada enlace se copia desde una fila.

**Architecture:** El detalle sigue siendo ficha con pestañas. Miembros y enlaces son tablas cortas, no un `DataList` paginado. Crear enlace y cambiar logo siguen en `FormSheet`, con un disparador que no se estira a todo el ancho. La ruta del enlace se reconstruye con `eventPath`; no se guarda una URL nueva.

**Tech Stack:** Next.js 16, shadcn `Button` y `FormSheet`, `CopyLinkButton`, Vitest. Archivos `.ts` y `.tsx` de máximo 90 líneas.

---

## Qué se ve mal hoy

En `src/app/admin/organismos/[id]/tabs.tsx` y `logo-tab.tsx` el contenido vive en un `grid` de una columna. El `Button` del sheet se estira y queda una barra magenta de lado a lado. Miembros es el texto `director: correo`. Enlace es el número «0 copias» y el botón «Crear enlace». No hay lista ni forma de copiar un enlace ya creado.

La pestaña CRM no se toca. El orden «primero la sesión, luego sus sectores» sigue en `docs/deuda-tecnica-enlace-por-sesion.md`. Este plan no lo resuelve.

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `src/lib/admin/organismos/member-label.ts` | Traduce `director`, `capturista` e `invitador`. |
| `src/lib/admin/organismos/link-rows.ts` | Arma filas con sector, sesión, fecha y ruta. |
| `src/lib/admin/organismos/detail.ts` | Trae nombre, correo y rol; trae sector y sesión de cada copia. |
| `src/app/admin/organismos/[id]/member-rows.tsx` | Tabla de miembros. |
| `src/app/admin/organismos/[id]/link-rows.tsx` | Tabla de enlaces y botón Copiar. |
| `src/app/admin/organismos/[id]/logo-tab.tsx` | Placa del logo y disparador corto. |
| `src/app/admin/organismos/[id]/tabs.tsx` | Elige la pestaña. |
| `src/app/admin/organismos/[id]/organismo-tab-nav.tsx` | La pestaña se llama Enlaces. |

## Task 1: Miembros en tabla

**Files:**
- Create: `src/lib/admin/organismos/member-label.ts`
- Create: `src/app/admin/organismos/[id]/member-rows.tsx`
- Modify: `src/app/admin/organismos/[id]/tabs.tsx`

- [ ] **Step 1: Escribir el caso**

```ts
import { describe, expect, it } from "vitest";
import { memberRoleLabel } from "./member-label";

describe("rol del miembro", () => {
  it("dice el rol en español", () => {
    expect(memberRoleLabel("director")).toBe("Director");
    expect(memberRoleLabel("capturista")).toBe("Capturista");
    expect(memberRoleLabel("invitador")).toBe("Invitador");
  });
});
```

- [ ] **Step 2: Correrlo y ver que falla**

Run: `npx vitest run src/lib/admin/organismos/member-label.test.ts`

Expected: FAIL, `memberRoleLabel` no existe.

- [ ] **Step 3: Implementar**

`member-label.ts` devuelve Director, Capturista o Invitador. Otro rol se devuelve tal cual.

`member-rows.tsx` pinta una tabla con columnas Nombre, Correo y Rol. Sin nombre, la celda es «Sin nombre». Sin correo, «Sin correo». Sin filas, el párrafo «Este organismo no tiene miembros.»

La tabla usa `w-full text-left text-small`, encabezado `border-b border-line text-ink-muted`, filas `border-b border-line`.

`tabs.tsx` deja de imprimir `rol: correo` y monta `MemberRows`.

- [ ] **Step 4: Correr el test**

Run: `npx vitest run src/lib/admin/organismos/member-label.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/organismos/member-label.ts src/lib/admin/organismos/member-label.test.ts src/app/admin/organismos/\[id\]/member-rows.tsx src/app/admin/organismos/\[id\]/tabs.tsx
git commit -m "feat: list organization members in a table"
```

## Task 2: Enlaces en tabla, con copiar

**Files:**
- Create: `src/lib/admin/organismos/link-rows.ts`
- Create: `src/app/admin/organismos/[id]/link-rows.tsx`
- Modify: `src/lib/admin/organismos/detail.ts`
- Modify: `src/app/admin/organismos/[id]/tabs.tsx`
- Modify: `src/app/admin/organismos/[id]/organismo-tab-nav.tsx`
- Modify: `src/lib/admin/organismos/detail.test.ts`

- [ ] **Step 1: Escribir el caso**

```ts
import { describe, expect, it } from "vitest";
import { linkRow } from "./link-rows";

describe("fila de enlace", () => {
  it("arma la ruta del sector y deja la fecha legible", () => {
    const row = linkRow({
      id: "c1",
      createdAt: "2026-11-10T18:00:00.000Z",
      sectorName: "Turismo",
      sectorSlug: "turismo",
      sessionLabel: "Quinta Real · 12 nov",
      token: "abc",
      sessionId: "sesion-1",
    });
    expect(row.sector).toBe("Turismo");
    expect(row.session).toBe("Quinta Real · 12 nov");
    expect(row.path).toBe("/turismo?abc&sesion=sesion-1");
    expect(row.created.length).toBeGreaterThan(0);
  });
});
```

Ajustar `path` al resultado real de `eventPath("turismo", "abc", "sesion-1")` si el query no usa `sesion=`.

- [ ] **Step 2: Correrlo y ver que falla**

Run: `npx vitest run src/lib/admin/organismos/link-rows.test.ts`

Expected: FAIL, `linkRow` no existe.

- [ ] **Step 3: Implementar**

`detail.ts` deja de pedir solo `id, sector_id, created_at`. Pide el nombre y el slug del sector, y la sede, la fecha y el horario de la sesión, para armar la etiqueta con `currentOption`.

`linkRow` usa `eventPath`. Si falta el sector, el nombre es «Sector desconocido» y `path` queda vacío.

`link-rows.tsx` es una tabla con Sector, Sesión, Creado y una última columna sin título. Cada fila con `path` monta `CopyLinkButton`. La URL que copia es la ruta absoluta: `window.location.origin` más `path`. Sin filas, el párrafo «Todavía no hay enlaces.»

El sheet de alta se queda. Su disparador es un `Button` `size="sm"` con `className="w-fit"` y el texto «Crear enlace». El formulario interno no cambia: sector, sesión y «Copiar enlace del evento». Si la query trae `enlace`, ese texto sigue visible encima de la tabla.

La pestaña pasa de «Enlace» a «Enlaces» en `organismo-tab-nav.tsx`. El value sigue siendo `enlace`.

El test de detalle espera `sectors(` y `sessions(` dentro del select de `link_copies`.

- [ ] **Step 4: Correr los tests**

Run: `npx vitest run src/lib/admin/organismos/link-rows.test.ts src/lib/admin/organismos/detail.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/organismos/link-rows.ts src/lib/admin/organismos/link-rows.test.ts src/lib/admin/organismos/detail.ts src/lib/admin/organismos/detail.test.ts src/app/admin/organismos/\[id\]/link-rows.tsx src/app/admin/organismos/\[id\]/tabs.tsx src/app/admin/organismos/\[id\]/organismo-tab-nav.tsx
git commit -m "feat: list organization invite links with a copy action"
```

## Task 3: Logo en una placa

**Files:**
- Modify: `src/app/admin/organismos/[id]/logo-tab.tsx`

- [ ] **Step 1: Reescribir la pestaña**

La placa es un cuadro `size-28 rounded-xl border border-line bg-elevated`. Con logo, la imagen va `size-full object-contain p-2`. Sin logo, el texto «Sin logo» centrado, `text-small text-ink-muted`.

Al lado, en `flex items-center gap-4`, va el disparador del sheet: `Button` `size="sm"` `variant="outline"` `className="w-fit"`, texto «Cambiar logo». El sheet sigue subiendo PNG, JPG o WebP de hasta 2 MB con `FileDrop` y `SheetSubmit`.

- [ ] **Step 2: Ver la pestaña en el navegador**

Abrir `/admin/organismos/70f6df8e-651f-45dd-8f5e-f19b7f2963b7?tab=logo`, `?tab=miembros` y `?tab=enlace`.

El botón ya no cruza la página. Miembros muestra nombre, correo y rol. Enlaces muestra la tabla, y Copiar deja el enlace en el portapapeles.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/organismos/\[id\]/logo-tab.tsx
git commit -m "feat: frame the organization logo instead of a full-width button"
```
